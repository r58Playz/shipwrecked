import type { Component, DLBoundPointer } from "dreamland/core";

export const TextInput: Component<{ value: DLBoundPointer<string>, placeholder?: string }> = function(cx) {
	cx.css = `
		:scope {
			background: #f3f4f6;
			outline: 1px solid #e5e7eb;
			border: none;
			border-radius: 4px;

			font-size: 18px;

			padding: 0.5rem;
		}
	`;

	return <input type="text" placeholder={this.placeholder || ""} value={use(this.value).bind()} />
}
