import { cascade, DLBasePointer, scope, type Component, type ComponentChild } from "dreamland/core";

export const ScrollingBackground: Component<{
	animation?: "both" | "bottom" | "top",
	// TODO fix this in dreamland,
	animationRoot?: HTMLElement,
	children: [ComponentChild, ComponentChild, ...ComponentChild[]]
}, {
	animationProgress: number,
	animationStart?: HTMLElement,
	animationEnd?: HTMLElement,
}> = function(cx) {
	cx.css = cascade`
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
		.background * {
			width: 100vw;
			height: 100vh;
			object-fit: cover;
		}

		.background-outer, .foreground, .background * {
			grid-area: a;
		}

		.foreground {
			z-index: 1;
		}
		
		.foreground .animation {
			height: 120vh;
			width: 100vw;
		}

		:scope > .animation {
			z-index: 2;
			pointer-events: none;
		}
	`;

	this.animationProgress = 0;

	function doAnimation(scrollProgress: number, element: HTMLElement, multiplier: number, offsetPercent: number): number | undefined {
		const startTop = element.offsetTop;
		const startHeight = element.offsetHeight;
		if (scrollProgress > startTop && scrollProgress < startTop + startHeight) {
			const percent = ((scrollProgress - startTop + startHeight * (offsetPercent / 100)) / (startHeight / multiplier));
			return percent;
		}
	}

	const multiplier = 3;
	const offsetPercent = 0;

	cx.mount = () => {
		if (this.animation && this.animationRoot) {
			const root = this.animationRoot;
			window.addEventListener("scroll", () => {
				const scrollProgress = root.scrollTop + (window.innerHeight / 2);

				const animationStart = cx.root.offsetTop;
				const animationEnd = cx.root.offsetTop + cx.root.offsetHeight;
				const contentStart = this.animationStart ? this.animationStart.offsetTop + this.animationStart.offsetHeight : animationStart;
				const contentEnd = this.animationEnd ? this.animationEnd.offsetTop : animationEnd;

				if (this.animationStart) {
					const percent = doAnimation(scrollProgress, this.animationStart, multiplier, offsetPercent);
					if (percent) {
						console.log((multiplier - percent) * 100);
						this.animationProgress = multiplier - percent;
					} else if (scrollProgress < animationStart) {
						this.animationProgress = 1;
					}
				}

				if (this.animationEnd) {
					const percent = doAnimation(scrollProgress, this.animationEnd, multiplier, -offsetPercent);
					if (percent) {
						console.log(percent * 100);
						this.animationProgress = percent;
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
				<div class="background">
					{this.children[0]}
				</div>
			</div>
			<div class="foreground">
				{this.animation === "both" || this.animation === "top" ? <div class="animation" this={use(this.animationStart).bind()} /> : null}
				{this.children.slice(1)}
				{this.animation === "both" || this.animation === "bottom" ? <div class="animation" this={use(this.animationEnd).bind()} /> : null}
			</div>
			{this.animation ? <div class="background-outer animation"><div class="background"><WaveAnimation progress={use(this.animationProgress)} /></div></div> : null}
		</div>
	)
}

const WaveAnimationCanvas: Component<{ progress: DLBasePointer<number> }> = function(cx) {
	cx.css = scope`
		:scope {
			z-index: 1;
		}
	`;

	cx.mount = () => {
		const root = cx.root as HTMLElement as HTMLCanvasElement;
		const ctx = root.getContext("2d");
		if (!ctx) throw "unable to get canvas ctx";

		use(this.progress).listen(progress => {
			requestAnimationFrame(() => {
				const { width, height } = root.getBoundingClientRect();
				root.width = width;
				root.height = height;
				ctx.clearRect(0, 0, width, height);
				ctx.fillRect(0, 0, progress * width, height);
			});
		});
	};

	return <canvas class="animation" />
}

let images: string[] = Array.from(Array(11), () => null!);

async function responseDataUrl(resp: Response): Promise<string> {
	return await new Promise(async (res, rej) => {
		const reader = new FileReader();
		reader.onload = function() {
			res(reader.result as string);
		};
		reader.onerror = function() {
			rej(reader.error);
		}
		reader.readAsDataURL(await resp.blob());
	});
}

async function fetchImages() {
	for (let i = 1; i <= 10; i++) {
		images[i] = await responseDataUrl(await fetch(`/wave/${i}.webp`));
	}
}

const WaveAnimationImage: Component<{ progress: DLBasePointer<number> }> = function(cx) {
	cx.css = scope`
		:scope {
			transform: scale(1, -1);
		}
	`;

	cx.mount = () => {
		const root = cx.root as HTMLElement as HTMLImageElement;

		const handle = (progress: number) => {
			const clamped = Math.floor(Math.max(Math.min(progress * 10, 10), 0));
			if (clamped == 0) {
				root.style.visibility = "hidden";
			} else {
				root.style.visibility = "visible";
				root.src = images[clamped];
			}
		}

		use(this.progress).listen(handle);
		handle(this.progress);
	};

	return <img class="animation" />
}

export const WaveAnimation = WaveAnimationImage;
await fetchImages();
