import { type Component, type ComponentChild } from "dreamland/core";

export const Card: Component<{ title: string, children: ComponentChild[] | ComponentChild }> = function(cx) {
	cx.css = `
		:scope {
			background: #e6d7d699;
			backdrop-filter: blur(12px);

			color: #3b2715;

			border: 1px rgb(230, 215, 214) solid;
			border-radius: 0.375rem;

			padding: 1.5rem;

			font-size: 1.125rem;
			font-family: Poppins, sans-serif;
		}

		:scope h1 {
			font-family: ohno-softie-variable, sans-serif;

			line-height: 1.1;
			font-weight: 600;

			font-size: 3.75rem;

			margin-top: 0;
			margin-bottom: 1rem;
		}
	`;

	return (
		<div>
			<h1>{this.title}</h1>
			{cx.children}
		</div>
	)
}
