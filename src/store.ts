import { createStore, type Stateful } from "dreamland/core";
import { epoxyVersion } from "./epoxyVersion";

export let settings: Stateful<{
	wispServer: string,
	epoxyVersion: string,

	token: string | null,
}> = createStore(
	{
		wispServer: "wss://anura.pro/",
		epoxyVersion: epoxyVersion,
		token: null,
	},
	{ ident: "settings", backing: "localstorage", autosave: "auto" },
);

// @ts-ignore
window.settings = settings;
