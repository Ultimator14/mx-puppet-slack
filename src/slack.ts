import {
	PuppetBridge,
	Log,
	IReceiveParams,
	IRemoteChanSend,
	IMessageEvent,
	IRemoteUserReceive,
	IRemoteChanReceive,
} from "mx-puppet-bridge";
import { Client } from "./client";

const log = new Log("SlackPuppet:slack");

interface ISlackPuppets {
	[puppetId: number]: {
		client: Client;
		data: any;
	}
}

export class Slack {
	private puppets: ISlackPuppets = {};
	constructor(
		private puppet: PuppetBridge,
	) { }

	public getUserParams(user: any): IRemoteUserReceive {
		return {
			userId: user.id,
			avatarUrl: user.profile.image_original,
			name: user.profile.display_name,
		} as IRemoteUserReceive;
	}

	public getChannelParams(puppetId: number, chan: any): IRemoteChanReceive {
		return {
			puppetId,
			roomId: chan.id,
			name: chan.name,
			topic: chan.topic ? chan.topic.value : "",
		} as IRemoteChanReceive;
	}

	public getSendParams(puppetId: number, data: any): IReceiveParams {
		return {
			chan: {
				roomId: data.channel,
				puppetId: puppetId,
			},
			user: {
				userId: data.user,
			},
		} as IReceiveParams;
	}

	public async removePuppet(puppetId: number) {
		log.info(`Removing puppet: puppetId=${puppetId}`);
		delete this.puppets[puppetId];
	}

	public async addPuppet(puppetId: number, data: any) {
		log.info(`Adding new Puppet: puppetId=${puppetId}`);
		if (this.puppets[puppetId]) {
			await this.removePuppet(puppetId);
		}
		const client = new Client(data.token);
		client.on("message", async (data) => {
			log.verbose("Got new message event");
			const params = this.getSendParams(puppetId, data);
			await this.puppet.sendMessage(params, data.text);
		});
		for (const ev of ["addUser", "updateUser", "updateBot"]) {
			client.on(ev, async (user) => {
				await this.puppet.updateUser(this.getUserParams(user));
			});
		}
		for (const ev of ["addChannel", "updateChannel"]) {
			client.on(ev, async (chan) => {
				await this.puppet.updateChannel(this.getChannelParams(puppetId, chan));
			});
		}
		this.puppets[puppetId] = {
			client,
			data,
		} as any;//ISlackPuppets;
		await client.connect();
	}

	public async handleMatrixMessage(room: IRemoteChanSend, data: IMessageEvent, event: any) {
		if (!this.puppets[room.puppetId]) {
			return;
		}
		await this.puppets[room.puppetId].client.sendMessage(data.body, room.roomId);
	}

	public async updateChannel(puppetId: number, cid: string) {
		const p = this.puppets[puppetId];
		if (!p) {
			return;
		}
		let chan = await p.client.getChannelById(cid);
		await this.puppet.updateChannel(this.getChannelParams(puppetId, chan))
	}

	public async updateUser(puppetId: number, uid: string) {
		const p = this.puppets[puppetId];
		if (!p) {
			return;
		}
		let user = await p.client.getUserById(uid);
		if (!user) {
			user = await p.client.getBotById(uid);
		}
		await this.puppet.updateUser(this.getUserParams(user));
	}
}
