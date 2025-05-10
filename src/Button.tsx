import { cascade, scope, type Component, type ComponentChild } from "dreamland/core"

import back from "./back.webp";

export const Button: Component<{ children: ComponentChild | ComponentChild[], "on:click": () => void }> = function(cx) {
	cx.css = cascade`
		:scope {
			background: #007bbd;
			color: white;
			border: 1px rgb(230, 215, 214) solid;
			border-radius: 3.40282e+38px; /* ??? */

			font-family: Poppins, sans-serif;
			font-size: 1rem;
			font-style: italic;
			line-height: 1.5rem;

			padding: 0.5em 1em;

			transition: all cubic-bezier(.4,0,.2,1) .3s;

			text-transform: uppercase;

			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		:scope:hover {
			border-color: rgb(245, 224, 24);

			box-shadow: 0 1px 3px 0 #007bbd33, 0 1px 2px -1px #007bbd33;

			scale: 105% 105%;
		}

		:scope:active {
			scale: 95% 95%;
		}

		img {
			width: 2rem;
			height: 2rem;
		}

		:scope:has(:only-child) {
			padding: 0.5rem;
		}
	`;

	return (
		<button on:click={this["on:click"]}>
			{this.children instanceof Array ?
				(this.children.map(x => typeof x === "string" ? <span>{x}</span> : x)) :
				(typeof this.children === "string" ? <span>{this.children}</span> : this.children)
			}
		</button>
	)
}

export const BackIcon: Component = function() {
	return <img src={back} />
}

export const ForwardIcon: Component = function(cx) {
	cx.css = scope`
		:scope {
			transform: scale(-1, 1);
		}
	`;

	return <img src={back} />
}
