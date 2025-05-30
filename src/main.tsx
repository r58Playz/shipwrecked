import { type Component } from "dreamland/core";
import { Router } from "dreamland/router";

import "./style.css";

import { ShorePage } from "./sections/shore";
import { HutPage } from "./sections/hut";
import { BayPage } from "./sections/bay";
import { RsvpPage } from "./sections/rsvp";
import { Button } from "./ui/Button";
import { ForwardIcon } from "./ui/Icon";
import "./epoxy";
import { Dashboard } from "./frontend/main";

const Hero: Component<{}, {
	shoreRoot: HTMLElement,
	hutTop: HTMLElement,
	hutBottom: HTMLElement,
	bayTop: HTMLElement,
	bayBottom: HTMLElement,
	rsvpRoot: HTMLElement,
}> = function(cx) {
	cx.css = `
		.signup {
			position: fixed;
			top: 2rem;
			right: 2rem;
			z-index: 2;
		}
	`;

	return (
		<div id="app">
			<ShorePage
				animationRoot={document.documentElement}
				root={use(this.shoreRoot).bind()}
				on:next={() => this.hutTop.scrollIntoView({ block: "center" })}
			/>
			<HutPage
				animationRoot={document.documentElement}
				top={use(this.hutTop).bind()}
				bottom={use(this.hutBottom).bind()}
				on:back={() => this.shoreRoot.scrollIntoView({ block: "center" })}
				on:next={() => this.bayTop.scrollIntoView({ block: "center" })}
			/>
			<BayPage
				animationRoot={document.documentElement}
				top={use(this.bayTop).bind()}
				bottom={use(this.bayBottom).bind()}
				on:back={() => this.hutBottom.scrollIntoView({ block: "center" })}
				on:next={() => this.rsvpRoot.scrollIntoView({ block: "center" })}
			/>
			<RsvpPage
				animationRoot={document.documentElement}
				root={use(this.rsvpRoot).bind()}
				on:back={() => this.bayBottom.scrollIntoView({ block: "center" })}
			/>
			<div class="signup">
				<Button on:click={() => this.rsvpRoot.scrollIntoView({ block: "center" })}>
					Log In <ForwardIcon />
				</Button>
			</div>
		</div>
	)
}

const Page404: Component<{ param?: string }> = function() {
	return <div>404 page not found: {use(this.param)}</div>
}

export let router = new Router([
	{
		show: <Hero />
	},
	{
		path: "dashboard",
		show: <Dashboard />
	},
	{
		path: ":param",
		show: <Page404 />
	}
]);
router.mount(document.querySelector("#app")!)
