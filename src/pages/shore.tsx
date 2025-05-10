import { scope, type Component, type DLBoundPointer } from "dreamland/core";

import { ScrollingBackground } from "../animation";
import { Button, ForwardIcon } from "../Button";

import shore from "./shore-cropped.webp";

import logo from "./logo.svg";
import calendar from "./calendar.webp";
import location from "./location.webp";

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
			width: 20rem;
			height: 20rem;
			object-fit: contain;
		}

		.info {
			text-shadow: 2px 2px 2px #007bbd;
			color: white;

			font-optical-sizing: auto;
			font-family: 'Baloo Da 2', sans-serif;
			font-weight: 700;

			text-transform: uppercase;

			font-size: 2rem;

			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.info img {
			width: 3rem;
			height: 3rem;
		}
	`;

	return (
		<div id="shore">
			<ScrollingBackground animation="bottom" animationRoot={this.animationRoot}>
				<img src={shore} alt="Shore Background" />
				<div class="content" this={use(this.root).bind()}>
					<img class="logo" src={logo} alt="Shipwrecked logo" />
					<div class="info">
						<img src={calendar} alt="Calendar icon" /><span>August 8-11, 2025</span>
					</div>
					<div class="info">
						<img src={location} alt="Location icon" /><span>Cathleen Stone Island, Boston Harbor</span>
					</div>
					<div>
						<Button on:click={this["on:next"]}>What's Hack Club Shipwrecked? <ForwardIcon /></Button>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	)
}
