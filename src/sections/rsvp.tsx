import { type Component, type DLBoundPointer } from "dreamland/core";

import { ScrollingBackground } from "../animation";
import { Button } from "../ui/Button";
import { BackIcon, ForwardIcon } from "../ui/Icon";
import { Card } from "../ui/Card";

import rsvp from "./rsvp.webp";
import { TextInput } from "../ui/Input";
import { deleteToken, fetchInfo, stealToken, userInfo } from "../frontend/api";
import { UserName } from "../frontend/apiComponents";
import { router } from "../main";

const LogIn: Component<{}, {
	emailLink: string,
	error: string | null,
}> = function(cx) {
	cx.css = `
		:scope {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.options {
			display: flex;
			flex-direction: row;
			gap: 1rem;
		}
	`;

	this.emailLink = "";
	this.error = null as string | null;

	return (
		<div>
			<div>
				This frontend requires you to use the <b>email</b> login method (so that it can steal the token to use). Right click and copy the log in link's address, then paste it here.
			</div>
			<div class="options">
				<TextInput value={use(this.emailLink).bind()} placeholder="Email Link" />
				<Button on:click={async () => {
					if (!await stealToken(this.emailLink))
						this.error = "Failed to steal token";
					else
						await fetchInfo();
				}}>Log In<ForwardIcon /></Button>
			</div>
			{use(this.error).andThen((x: string) => <div class="error">{x}</div>)}
		</div>
	)
}

const Info: Component = function(cx) {
	cx.css = `
		:scope {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.options {
			display: flex;
			flex-direction: row;
			gap: 1rem;
		}
	`;

	return (
		<div>
			<div>
				Logged in as <UserName /> with Hackatime ID {use(userInfo.data).map(x => x?.hackatimeId)}.
			</div>
			<div class="options">
				<Button on:click={() => deleteToken()}><BackIcon />Log Out</Button>
				<Button on:click={() => router.navigate("dashboard")}>Go to the Bay<ForwardIcon /></Button>
			</div>
		</div>
	)
}

export const RsvpPage: Component<{
	animationRoot: HTMLElement,
	root: DLBoundPointer<HTMLElement>,
	"on:back": () => void,
}, {
	emailLink: string,
	error: string | null,
}> = function(cx) {
	cx.css = `
		.content {
			height: 100vh;
			padding: 1em;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.card {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.options {
			display: flex;
			flex-direction: row;
			gap: 1rem;
		}

		.error { color: red; }
	`;


	cx.mount = async () => {
		await fetchInfo();
	};

	return (
		<div id="shore">
			<ScrollingBackground animation="top" animationRoot={this.animationRoot}>
				<img src={rsvp} alt="RSVP Background" loading="lazy" />
				<div class="content" this={use(this.root).bind()}>
					<Card title="Log In">
						<div class="card">
							<div>
								Note that this is not the official site. You can return to the official site using the button below.
							</div>
							{use(userInfo.data).andThen(<Info />, <LogIn />)}
							<div class="options">
								<Button on:click={this["on:back"]} label="Back"><BackIcon /></Button>
								<Button on:click={() => window.open("https://shipwrecked.hackclub.com/bay/login")}>Open official site<ForwardIcon /></Button>
							</div>
						</div>
					</Card>
				</div>
			</ScrollingBackground>
		</div>
	)
}
