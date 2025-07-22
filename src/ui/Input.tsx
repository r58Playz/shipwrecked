import { css, type Component } from "dreamland/core";

export const TextInput: Component<{
	value: string;
	placeholder?: string;
}> = function () {
	return (
		<input
			type="text"
			placeholder={this.placeholder || ""}
			value={use(this.value).bind()}
		/>
	);
};
TextInput.style = css`
	:scope {
		background: #f3f4f6;
		outline: 1px solid #e5e7eb;
		border: none;
		border-radius: 4px;

		font-family: Poppins;
		font-size: 18px;

		padding: 0.5rem;
	}
`;
