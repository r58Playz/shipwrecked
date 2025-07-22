import { css, type Component } from "dreamland/core";

import back from "./back.webp";

export const BackIcon: Component = function () {
	return <img src={back} alt="Back icon" class="Ui-back-icon" />;
};

export const ForwardIcon: Component = function () {
	return <img src={back} alt="Forward icon" class="Ui-forward-icon" />;
};
ForwardIcon.style = css`
	:scope {
		transform: scale(-1, 1);
	}
`;
