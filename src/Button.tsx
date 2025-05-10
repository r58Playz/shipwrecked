import { scope, type Component, type ComponentChild } from "dreamland/core"

export const Button: Component<{ children: ComponentChild[] | ComponentChild, "on:click": () => void }> = function(cx) {
	cx.css = scope`
		:scope {
			background: #007bbd;
			color: white;
			border: 1px rgb(230, 215, 214) solid;
			border-radius: 3.40282e+38px; /* ??? */

			font-family: Poppins, sans-serif;
			font-size: 1em;
			font-style: italic;
			line-height: 1.5em;

			padding: 0.5em 1em;

			transition: all cubic-bezier(.4,0,.2,1) .3s;

			text-transform: uppercase;
		}

		:scope:hover {
			border-color: rgb(245, 224, 24);

			box-shadow: 0 1px 3px 0 #007bbd33, 0 1px 2px -1px #007bbd33;

			scale: 105% 105%;
		}
	`;

	return (
		<button on:click={this["on:click"]}>
			{this.children}
		</button>
	)
}
