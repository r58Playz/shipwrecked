import { createStore, type Stateful } from "dreamland/core";

export let settings: Stateful<{
	wispServer: string;
	epoxyVersion: string;

	token: string | null;
}> = createStore(
	{
		wispServer: "wss://anura.pro/",
		epoxyVersion: "",
		token: null,
	},
	{ ident: "settings", backing: "localstorage", autosave: "auto" }
);

(self as any).settings = settings;
