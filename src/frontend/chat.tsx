import type { Component, DLBasePointer } from "dreamland/core";

import {
	clearCache,
	fetchChat,
	fetchGallery,
	submitChat,
	userInfo,
	type ChatMessage,
	type User,
} from "./api";
import { RandomBackground } from "./background";
import { Loading, UserName } from "./apiComponents";
import { Button } from "../ui/Button";
import { router } from "../main";
import { BackIcon, ForwardIcon } from "../ui/Icon";
import { Card } from "../ui/Card";

interface ExtendedChatMessage extends ChatMessage {
	user: {
		id: string;
		name: string | null;
		image: string | null;
	};
}

const RealChat: Component<
	{
		messages: ExtendedChatMessage[];
		"on:submit": (comment: string) => Promise<void>;
	},
	{ comment: string }
> = function (cx) {
	cx.css = `
		:scope {
			padding: 1em;
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: 1em;

			overflow: scroll;
		}

		:scope > :global(:first-child) {
			align-self: center;
		}

		.comment {
			white-space: pre-wrap;
			word-break: break-all;
		}

		.reviewbox {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.reviewbox textarea {
			min-height: 8rem;

			background: #f3f4f6;
			outline: 1px solid #e5e7eb;
			border: none;
			border-radius: 4px;

			font-family: Poppins;
			font-size: 18px;

			padding: 0.5rem;
		}
	`;

	this.comment = "";

	return (
		<div>
			<Card title="Project Chat" />
			{use(this.messages).mapEach((x) => (
				<Card
					title={<UserName user={x.user as any as DLBasePointer<User>} />}
					project={true}
				>
					<div class="comment">{x.content}</div>
				</Card>
			))}
			<Card title="Write a chat message" project={true}>
				<div class="reviewbox">
					<textarea value={use(this.comment).bind()} />
					<div>
						<Button
							on:click={async () => {
								await this["on:submit"](this.comment);
								this.comment = "";
							}}
						>
							Submit
							<ForwardIcon />
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
};

export const Chat: Component<
	{ project?: string; location?: string },
	{ chat?: ExtendedChatMessage[] },
	{ "on:routeshown": () => void }
> = function (cx) {
	cx.css = `
		:scope {
			width: 100%;
			height: 100%;

			display: grid;
			grid-template-areas: "a";
		}

		:scope > :global(*) {
			grid-area: a;
		}

		.logout-container {
			padding: 1em;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}
	`;

	this.chat = undefined;
	this.project = undefined;

	const obfuscateUsername = (userId: string) => {
		// Create a simple hash to generate consistent animal names
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			hash = (hash << 5) - hash + userId.charCodeAt(i);
			hash = hash & hash; // Convert to 32-bit integer
		}

		const animals = [
			"Fox",
			"Wolf",
			"Bear",
			"Eagle",
			"Shark",
			"Tiger",
			"Lion",
			"Panda",
			"Owl",
			"Hawk",
			"Raven",
			"Falcon",
			"Lynx",
			"Otter",
			"Seal",
			"Whale",
			"Dolphin",
			"Penguin",
			"Koala",
			"Sloth",
			"Gecko",
			"Viper",
			"Cobra",
			"Phoenix",
			"Dragon",
			"Unicorn",
			"Griffin",
			"Kraken",
			"Hydra",
			"Sphinx",
		];

		const adjectives = [
			"Swift",
			"Bold",
			"Wise",
			"Calm",
			"Wild",
			"Brave",
			"Cool",
			"Sharp",
			"Quick",
			"Zen",
			"Fire",
			"Ice",
			"Storm",
			"Night",
			"Dawn",
			"Void",
			"Neon",
			"Cyber",
			"Nova",
			"Stealth",
			"Shadow",
			"Light",
			"Dark",
			"Mystic",
		];

		const animalIndex = Math.abs(hash) % animals.length;
		const adjIndex = Math.abs(hash >> 8) % adjectives.length;

		return `${adjectives[adjIndex]}${animals[animalIndex]}`;
	};

	const lookup = (message: ChatMessage): ExtendedChatMessage => {
		let user = {
			id: message.userId,
			name: null as string | null,
			image: null as string | null,
		};

		if (location.pathname.includes("-doxx")) {
			let project;
			if (
				(project = userInfo.gallery?.find((x) => x.userId === message.userId))
			) {
				user.name = project.user.name;
				user.image = project.user.image;
			}
		} else {
			user.name = obfuscateUsername(user.id);
		}

		return { ...message, user: user };
	};

	const reload = async () => {
		this.chat = undefined;
		clearCache();
		await fetchGallery();
		if (this.project) {
			let x = await fetchChat(this.project);
			this.chat = x.map(lookup);
		}
	};
	this["on:routeshown"] = reload;
	const submit = async (comment: string) => {
		await submitChat(this.project!, comment);
		await reload();
	};

	return (
		<div>
			<RandomBackground />
			{use(this.chat).andThen(
				(x: ExtendedChatMessage[]) => (
					<RealChat messages={x} on:submit={submit} />
				),
				<Loading />
			)}
			<div class="logout-container">
				<Button
					on:click={() => {
						router.navigate("/" + (this.location || "").replace("-doxx", ""));
					}}
				>
					<BackIcon />
					Back
				</Button>
			</div>
		</div>
	);
};
