import type { Component } from "dreamland/core";

import back from "./back.webp";

export const BackIcon: Component = function () {
	return <img src={back} alt="Back icon" class="Ui-back-icon" />;
};

export const ForwardIcon: Component = function (cx) {
	cx.css = `
		:scope {
			transform: scale(-1, 1);
		}
	`;

	return <img src={back} alt="Forward icon" class="Ui-forward-icon" />;
};
