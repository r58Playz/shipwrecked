import { scope, type Component } from "dreamland/core";

import "./style.css";

import { ShorePage } from "./pages/shore";
import { HutPage } from "./pages/hut";
import { BayPage } from "./pages/bay";
import { RsvpPage } from "./pages/rsvp";

const App: Component<{}, {
	shoreRoot: HTMLElement,
	hutTop: HTMLElement,
	hutBottom: HTMLElement,
	bayTop: HTMLElement,
	bayBottom: HTMLElement,
	rsvpRoot: HTMLElement,
}> = function(cx) {
	cx.css = scope`
		.hut {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.full {
			height: 100vh;
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
		</div>
	)
}

document.querySelector("#app")!.replaceWith(<App />);
