import type { Component } from "dreamland/core";

import shore from "../sections/shore.webp";
import hut from "../sections/hut.webp";
import bay from "../sections/bay.webp";
import rsvp from "../sections/rsvp.webp";

let backgrounds = [shore, hut, bay, rsvp];

export const RandomBackground: Component = function(cx) {
	cx.css = `
		:scope {
			width: 100%;
			height: 100vh;
			object-fit: cover;
		}

		:scope.idx-1, :scope.idx-2 {
			object-position: right top;
		}
	`;

	let idx = Math.floor(Math.random() * backgrounds.length);
	let background = backgrounds[idx];
	return <img src={background} class={`Ui-RandomBackground idx-${idx}`} />
}
