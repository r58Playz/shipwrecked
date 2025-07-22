import { css, Pointer, type Component, type ComponentChild } from "dreamland/core";

export const Card: Component<{
	title: ComponentChild;
	children?: ComponentChild[] | ComponentChild;
	small?: boolean;
	project?: boolean;
	noPadding?: boolean;
}> = function (cx) {
	return (
		<div
			class="Ui-card"
			class:small={use(this.small) as Pointer<boolean>}
			class:project={use(this.project) as Pointer<boolean>}
			class:padding={use(this.noPadding).map((x) => !x)}
		>
			<h1>{this.title}</h1>
			{cx.children}
		</div>
	);
};
Card.style = css`
	:scope {
		background: #e6d7d699;
		backdrop-filter: blur(12px);

		color: #3b2715;

		border: 1px rgb(230, 215, 214) solid;
		border-radius: 0.375rem;

		padding: 1.5rem;

		font-size: 1.125rem;
	}

	h1 :global(*) {
		font-family: ohno-softie-variable, sans-serif;
	}
	h1 {
		font-family: ohno-softie-variable, sans-serif;

		line-height: 1.1;
		font-weight: 600;

		font-size: 3.75rem;

		margin-top: 0;
		margin-bottom: 0;
	}
	:scope.small h1 {
		font-size: 2.75rem;
	}
	:scope.project {
		display: flex;
		flex-direction: column;
	}
	:scope.project h1 {
		font-size: 2rem;
	}

	:scope.padding h1:not(:last-child) {
		margin-top: 0;
		margin-bottom: 1rem;
	}
`;
