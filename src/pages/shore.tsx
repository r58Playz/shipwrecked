import { DLBoundPointer, scope, type Component } from "dreamland/core";
import { ScrollingBackground } from "../animation";

import shore from "./shore-cropped.webp";
import logo from "./logo-outline.svg";
import { Button } from "../Button";

export const ShorePage: Component<{
	animationRoot: HTMLElement,
	root: DLBoundPointer<HTMLElement>,
	"on:next": () => void,
}> = function(cx) {
	cx.css = scope`
		.content {
			height: 100vh;
			padding: min(3rem, 5vh) min(7.5rem, 10vw);
			display: flex;
			flex-direction: column;
			align-items: left;
			justify-content: start;
		}

		.logo {
			width: min(20rem, 50vw);
			height: min(20rem, 50vw);
		}

		.info {
			text-shadow: 2px 2px 2px #007bbd;
			color: white;

			font-optical-sizing: auto;
			font-family: 'Baloo Da 2', sans-serif;
			font-weight: 700;

			text-transform: uppercase;

			font-size: 2rem;
		}
	`;

	return (
		<div id="shore">
			<ScrollingBackground animation="bottom" animationRoot={this.animationRoot}>
				<img src={shore} />
				<div class="content" this={use(this.root).bind()}>
					<img class="logo" src={logo} />
					<div class="info">
						<span>📅</span> August 8-11, 2025
					</div>
					<div class="info">
						<span>📅</span> Cathleen Stone Island, Boston Harbor
					</div>
					<div>
						<Button on:click={this["on:next"]}>What's Hack Club Shipwrecked?</Button>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	)
}
