import type { Component, ComponentChild } from "dreamland/core";

export const ToggleButton: Component<{
	value: boolean;
	children: ComponentChild[] | ComponentChild;
}> = function (cx) {
	cx.css = `
		:scope {
			background: #f6f3f4;
			color: #364153;

			border-radius: 0.5rem;
			text-align: center;
			padding: 0.5rem 0.75rem;

			cursor: pointer;

			transition: .15s cubic-bezier(.4,0,.2,1) all;
		}

		:scope:not([aria-checked='true']):hover {
			background: #ebe6e7;
		}

		:scope[aria-checked='true'] {
			background: #155dfc;
			color: #ffffff;
		}
	`;

	return (
		<div
			aria-checked={use(this.value)}
			on:click={() => (this.value = !this.value)}
		>
			{cx.children}
		</div>
	);
};
