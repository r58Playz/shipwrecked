import { scope, type Component, type DLBoundPointer } from "dreamland/core";

import { ScrollingBackground } from "../animation";
import { Card } from "../Card";
import { BackIcon, Button, ForwardIcon } from "../Button";

import hut from "./hut.webp";

export const HutPage: Component<{
	animationRoot: HTMLElement,
	top: DLBoundPointer<HTMLElement>,
	bottom: DLBoundPointer<HTMLElement>,
	"on:back": () => void,
	"on:next": () => void,
}> = function(cx) {
	cx.css = scope`
		.hut {
			object-position: right top;
		}

		.foreground {
			width: 100%;
		}
		.page {
			height: 100vh;
			display: flex;
			align-items: center;
		}
		.page > div {
			max-width: 60rem;
			padding: 0 1rem;

			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.buttons {
			display: flex;
			gap: 1rem;
		}
	`;

	return (
		<div id="hut">
			<ScrollingBackground animation="both" animationRoot={this.animationRoot}>
				<img class="hut" src={hut} alt="Hut Background" loading="lazy" />
				<div class="foreground">
					<div class="page" this={use(this.top).bind()}>
						<div>
							<Card title="What's Hack Club Shipwrecked?">
								On <b>August 8-11</b>, you and 130 other students will gather on <b>Cathleen Stone Island in the Boston Harbor</b> for{" "}
								a once in a lifetime, <b>4-day story-based hackathon</b>!
								<br /><br />
								As soon as you get there, you'll all start working together to survive the island you've been stranded on.
							</Card>
							<div class="buttons">
								<Button on:click={this["on:back"]} label="Back"><BackIcon /></Button>
								<Button on:click={() => this.bottom.scrollIntoView({ block: "center" })}>What will we do on the island? <ForwardIcon /></Button>
							</div>
						</div>
					</div>
					<div class="page" this={use(this.bottom).bind()}>
						<div>
							<Card title="What's Hack Club Shipwrecked?">
								Once we're on the island, everyone will work in smaller groups and complete quests. These will be centered around interacting with the world around you: helping the island dwellers develop software or hardware projects that help them sell their produce, helping the pirates plan their routes more effectively, or building projects to help your fellow shipwreck-mates organize your efforts more effectively. <em>(Not literally, of course... there are no pirates or island dwellers in the Boston Harbor. This is similar to Dungeons &amp; Dragons!)</em>
							</Card>
							<div class="buttons">
								<Button on:click={() => this.top.scrollIntoView({ block: "center" })} label="Back"><BackIcon /></Button>
								<Button on:click={this["on:next"]}>How do I get invited? <ForwardIcon /></Button>
							</div>
						</div>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	)
}
