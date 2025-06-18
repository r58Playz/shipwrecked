import { type Component, type ComponentChild } from "dreamland/core";

export const Button: Component<{
	children: ComponentChild | ComponentChild[];
	"on:click": () => void;
	label?: string;
}> = function (cx) {
	cx.css = `
		:scope {
			background: #007bbd;
			color: white;
			border: 1px rgb(230, 215, 214) solid;
			border-radius: 3.40282e+38px; /* ??? */

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

		:scope > :global(img) {
			width: 2rem;
			height: 2rem;
		}

		${
			(cx.children instanceof Array ? cx.children.length === 1 : !!cx.children)
				? `
		:scope {
			padding: 0.5rem;
		}
		`
				: ""
		}
	`;

	return (
		<button
			on:click={this["on:click"]}
			aria-label={this.label ? this.label : ""}
			class="Ui-button"
		>
			{cx.children}
		</button>
	);
};
