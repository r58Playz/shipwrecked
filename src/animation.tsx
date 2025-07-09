import { type Component, type ComponentChild } from "dreamland/core";

export const ScrollingBackground: Component<
	{
		animation?: "both" | "bottom" | "top";
		animationRoot?: HTMLElement;
		children: [ComponentChild, ComponentChild, ...ComponentChild[]];
	},
	{
		animationProgress: number;
		animationStart?: HTMLElement;
		animationEnd?: HTMLElement;
	}
> = function (cx) {
	this.animationProgress = 0;

	function doAnimation(
		scrollProgress: number,
		element: HTMLElement,
		multiplier: number,
		offsetPercent: number
	): number | undefined {
		const startTop = element.offsetTop;
		const startHeight = element.offsetHeight;
		if (scrollProgress > startTop && scrollProgress < startTop + startHeight) {
			const percent =
				(scrollProgress - startTop + startHeight * (offsetPercent / 100)) /
				(startHeight / multiplier);
			return percent;
		}
	}

	function log(percent: number) {
		console.log("anim:", percent * 100, "%");
	}

	const multiplier = 2;
	const offsetPercent = 0;

	cx.mount = () => {
		if (this.animation && this.animationRoot) {
			const root = this.animationRoot;
			window.addEventListener("scroll", () => {
				const scrollProgress = root.scrollTop + window.innerHeight / 2;

				const animationStart = cx.root.offsetTop;
				const animationEnd = cx.root.offsetTop + cx.root.offsetHeight;
				const contentStart = this.animationStart
					? this.animationStart.offsetTop + this.animationStart.offsetHeight
					: animationStart;
				const contentEnd = this.animationEnd
					? this.animationEnd.offsetTop
					: animationEnd;

				if (this.animationStart) {
					const percent = doAnimation(
						scrollProgress,
						this.animationStart,
						multiplier,
						offsetPercent
					);
					if (percent) {
						this.animationProgress = multiplier - percent;
						log(this.animationProgress);
					} else if (scrollProgress < animationStart) {
						this.animationProgress = 1;
					}
				}

				if (this.animationEnd) {
					const percent = doAnimation(
						scrollProgress,
						this.animationEnd,
						multiplier,
						-offsetPercent
					);
					if (percent) {
						this.animationProgress = percent;
						log(this.animationProgress);
					} else if (scrollProgress > animationEnd) {
						this.animationProgress = 1;
					}
				}

				if (scrollProgress > contentStart && scrollProgress < contentEnd) {
					this.animationProgress = 0;
				}
			});
		}
	};

	return (
		<div>
			<div class="background-outer">
				<div class="background">{cx.children[0]}</div>
			</div>
			<div class="foreground">
				{this.animation === "both" || this.animation === "top" ? (
					<div class="animation" this={use(this.animationStart).bind()} />
				) : null}
				{cx.children.slice(1)}
				{this.animation === "both" || this.animation === "bottom" ? (
					<div class="animation" this={use(this.animationEnd).bind()} />
				) : null}
			</div>
			{this.animation ? (
				<div class="background-outer animation">
					<div class="background">
						<WaveAnimation progress={use(this.animationProgress)} />
					</div>
				</div>
			) : null}
		</div>
	);
};
ScrollingBackground.css = `
	:scope, .background {
		display: grid;
		grid-template-areas: "a";
	}

	.background-outer {
		position: relative;
	}

	.background {
		position: sticky;
		top: 0;
	}
	.background > :global(*) {
		width: 100%;
		height: 100vh;
		object-fit: cover;
	}

	.background-outer, .foreground {
		grid-area: a;
	}

	.foreground {
		z-index: 1;
	}
	
	.foreground .animation {
		height: 100vh;
		width: 100%;
	}

	:scope > .animation {
		z-index: 2;
		pointer-events: none;
	}
`;

const WaveAnimationCanvas: Component<{ progress: number }> = function (cx) {
	cx.mount = () => {
		const root = cx.root as HTMLElement as HTMLCanvasElement;
		const ctx = root.getContext("2d");
		if (!ctx) throw "unable to get canvas ctx";

		use(this.progress).listen((progress) => {
			requestAnimationFrame(() => {
				const { width, height } = root.getBoundingClientRect();
				root.width = width;
				root.height = height;
				ctx.clearRect(0, 0, width, height);
				ctx.fillRect(0, 0, progress * width, height);
			});
		});
	};

	return <canvas class="animation" />;
};
WaveAnimationCanvas.css = `
	:scope {
		z-index: 1;
	}
`;

let images: string[] = Array.from(Array(11), () => null!);

async function responseDataUrl(resp: Response): Promise<string> {
	return await new Promise(async (res, rej) => {
		const reader = new FileReader();
		reader.onload = function () {
			res(reader.result as string);
		};
		reader.onerror = function () {
			rej(reader.error);
		};
		reader.readAsDataURL(await resp.blob());
	});
}

async function fetchImages() {
	images = await Promise.all(
		images.map(async (_, i) => {
			if (i > 0) {
				return await responseDataUrl(await fetch(`/wave/${i}.svg`));
			} else {
				return null!;
			}
		})
	);
}
const imagePromise = fetchImages();

const WaveAnimationImage: Component<{ progress: number }> = function (cx) {
	cx.mount = async () => {
		await imagePromise;
		const root = cx.root as HTMLElement as HTMLImageElement;

		const handle = (progress: number) => {
			const clamped = Math.floor(Math.max(Math.min(progress * 10, 10), 0));
			if (clamped == 0) {
				root.style.visibility = "hidden";
			} else {
				root.style.visibility = "visible";
				root.src = images[clamped];
			}
		};

		use(this.progress).listen(handle);
		handle(this.progress);
	};

	return <img class="animation" />;
};
WaveAnimationImage.css = `
	:scope {
		transform: scale(1, -1);
	}
`;

export const WaveAnimation = WaveAnimationImage;
