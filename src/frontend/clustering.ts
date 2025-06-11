import { getProjectHours, type ProjectGallery } from "./api";

export interface UserMetrics {
	userId: string;
	totalHours: number;
	projectCount: number;
	shippedProjectCount: number;
	isWhale?: boolean;
	isNewbie?: boolean;
	isShipper?: boolean;
}

export interface UserClusterAnalysis {
	totalUsers: number;
	clusters: {
		whales: {
			count: number;
			percentage: number;
			users: string[]; // User IDs
			thresholds: {
				minHours: number;
				minProjects: number;
				minShipped: number;
			};
		};
		shippers: {
			count: number;
			percentage: number;
			users: string[];
			thresholds: {
				hourRange: [number, number];
				projectRange: [number, number];
				shippedRange: [number, number];
			};
		};
		newbies: {
			count: number;
			percentage: number;
			users: string[];
			thresholds: {
				maxHours: number;
				maxProjects: number;
				maxShipped: number;
			};
		};
	};
	statistics: {
		hours: {
			mean: number;
			median: number;
			p75: number;
			p90: number;
		};
		projects: {
			mean: number;
			median: number;
			p75: number;
			p90: number;
		};
		shipped: {
			mean: number;
			median: number;
			p75: number;
			p90: number;
		};
	};
}

export function galleryToMetrics(gallery: ProjectGallery[]): UserMetrics[] {
	let map = new Map<string, UserMetrics>();

	for (const project of gallery) {
		const mapMetrics = map.get(project.userId);
		let metrics: UserMetrics;
		if (mapMetrics) {
			metrics = mapMetrics;
		} else {
			metrics = { userId: project.userId, totalHours: 0, projectCount: 0, shippedProjectCount: 0 };
			map.set(project.userId, metrics);
		}

		metrics.projectCount++;
		metrics.shippedProjectCount += project.shipped ? 1 : 0;
		metrics.totalHours += getProjectHours(project);
	}

	return [...map.values()];
}

// taken straight from lib/userClustering.ts
function calculatePercentile(sortedArray: number[], percentile: number): number {
	if (sortedArray.length === 0) return 0;

	const index = (percentile / 100) * (sortedArray.length - 1);
	const lower = Math.floor(index);
	const upper = Math.ceil(index);

	if (lower === upper) {
		return sortedArray[lower];
	}

	const weight = index - lower;
	return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

function categorizeUsers(userMetrics: UserMetrics[]): {
	whales: UserMetrics[];
	shippers: UserMetrics[];
	newbies: UserMetrics[];
	thresholds: any;
} {
	if (userMetrics.length === 0) {
		return {
			whales: [],
			shippers: [],
			newbies: [],
			thresholds: { whale: {}, shipper: {}, newbie: {} }
		};
	}

	// Calculate percentiles for each dimension
	const sortedHours = userMetrics.map(u => u.totalHours).sort((a, b) => a - b);
	const sortedProjects = userMetrics.map(u => u.projectCount).sort((a, b) => a - b);
	const sortedShipped = userMetrics.map(u => u.shippedProjectCount).sort((a, b) => a - b);

	// Define thresholds
	const hoursP75 = calculatePercentile(sortedHours, 75);
	const hoursP50 = calculatePercentile(sortedHours, 50);
	const hoursP25 = calculatePercentile(sortedHours, 25);

	const projectsP75 = calculatePercentile(sortedProjects, 75);
	const projectsP50 = calculatePercentile(sortedProjects, 50);
	const projectsP25 = calculatePercentile(sortedProjects, 25);

	const shippedP75 = calculatePercentile(sortedShipped, 75);
	const shippedP50 = calculatePercentile(sortedShipped, 50);

	// Whale criteria: Top 25% in at least 2 dimensions, and above median in all
	const whaleThresholds = {
		minHours: hoursP50,
		minProjects: projectsP50,
		minShipped: Math.max(1, shippedP50) // At least 1 shipped project
	};

	// Newbie criteria: Bottom 25% in hours AND projects, and 0 shipped
	const newbieThresholds = {
		maxHours: hoursP25,
		maxProjects: Math.max(1, projectsP25), // 0-1 projects
		maxShipped: 0 // No shipped projects
	};

	// Shipper criteria: Everything in between
	const shipperThresholds = {
		hourRange: [hoursP25, hoursP75] as [number, number],
		projectRange: [projectsP25, projectsP75] as [number, number],
		shippedRange: [0, shippedP75] as [number, number]
	};

	const whales: UserMetrics[] = [];
	const newbies: UserMetrics[] = [];
	const shippers: UserMetrics[] = [];

	userMetrics.forEach(user => {
		// Check for Whale: High performance in at least 2/3 dimensions
		const isHighHours = user.totalHours >= hoursP75;
		const isHighProjects = user.projectCount >= projectsP75;
		const isHighShipped = user.shippedProjectCount >= shippedP75;
		const highDimensionCount = [isHighHours, isHighProjects, isHighShipped].filter(Boolean).length;

		const meetsWhaleMinimums = user.totalHours >= whaleThresholds.minHours &&
			user.projectCount >= whaleThresholds.minProjects &&
			user.shippedProjectCount >= whaleThresholds.minShipped;

		// Check for Newbie: Low engagement across all dimensions
		const isNewbie = user.totalHours <= newbieThresholds.maxHours &&
			user.projectCount <= newbieThresholds.maxProjects &&
			user.shippedProjectCount <= newbieThresholds.maxShipped;

		if (highDimensionCount >= 2 && meetsWhaleMinimums) {
			user.isWhale = true;
			whales.push(user);
		} else if (isNewbie) {
			user.isNewbie = true;
			newbies.push(user);
		} else {
			user.isShipper = true;
			shippers.push(user);
		}
	});

	return {
		whales,
		shippers,
		newbies,
		thresholds: {
			whale: whaleThresholds,
			shipper: shipperThresholds,
			newbie: newbieThresholds
		}
	};
}

export function generateUserClusterAnalysis(userMetrics: UserMetrics[]): UserClusterAnalysis {
	// Categorize users
	const { whales, shippers, newbies, thresholds } = categorizeUsers(userMetrics);

	// Calculate statistics
	const sortedHours = userMetrics.map(u => u.totalHours).sort((a, b) => a - b);
	const sortedProjects = userMetrics.map(u => u.projectCount).sort((a, b) => a - b);
	const sortedShipped = userMetrics.map(u => u.shippedProjectCount).sort((a, b) => a - b);

	const statistics = {
		hours: {
			mean: sortedHours.reduce((sum, h) => sum + h, 0) / sortedHours.length,
			median: calculatePercentile(sortedHours, 50),
			p75: calculatePercentile(sortedHours, 75),
			p90: calculatePercentile(sortedHours, 90)
		},
		projects: {
			mean: sortedProjects.reduce((sum, p) => sum + p, 0) / sortedProjects.length,
			median: calculatePercentile(sortedProjects, 50),
			p75: calculatePercentile(sortedProjects, 75),
			p90: calculatePercentile(sortedProjects, 90)
		},
		shipped: {
			mean: sortedShipped.reduce((sum, s) => sum + s, 0) / sortedShipped.length,
			median: calculatePercentile(sortedShipped, 50),
			p75: calculatePercentile(sortedShipped, 75),
			p90: calculatePercentile(sortedShipped, 90)
		}
	};

	const totalActiveUsers = userMetrics.length;

	const analysis: UserClusterAnalysis = {
		totalUsers: totalActiveUsers,
		clusters: {
			whales: {
				count: whales.length,
				percentage: (whales.length / totalActiveUsers) * 100,
				users: whales.map(u => u.userId),
				thresholds: thresholds.whale
			},
			shippers: {
				count: shippers.length,
				percentage: (shippers.length / totalActiveUsers) * 100,
				users: shippers.map(u => u.userId),
				thresholds: thresholds.shipper
			},
			newbies: {
				count: newbies.length,
				percentage: (newbies.length / totalActiveUsers) * 100,
				users: newbies.map(u => u.userId),
				thresholds: thresholds.newbie
			}
		},
		statistics,
	};

	return analysis;
}
