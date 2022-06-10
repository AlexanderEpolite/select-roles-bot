import {SingleWorker} from "discord-rose";
import {InteractionResponseType, MessageFlags} from "discord-api-types";

const secrets = require("../secrets.json");
const components = require("../components.json");

const worker = new SingleWorker({
    token: secrets.token,
    intents: 131071,
});

worker.setStatus("listening", "It Has To Be This Way", "idle");

worker.on("MESSAGE_CREATE", async (msg) => {
    if(msg.content.toLowerCase().replace(/,/g, "") === "standing here i realize") {
        await worker.api.messages.send(msg.channel_id, {
            content: "You are just like me, trying to make history",
            message_reference: {
                message_id: msg.id,
                channel_id: msg.channel_id,
                fail_if_not_exists: true,
            },
        });
    }
    
    const rand = Math.random() * 500;
    
    //1 in 500 chance to send this gif
    if(rand >= 499 && !msg.author.bot) {
        await worker.api.messages.send(msg.channel_id, {
            content: "https://tenor.com/view/steven-armstrong-metal-gear-rising-metal-gear-solid-gif-24704841",
            message_reference: {
                message_id: msg.id,
                channel_id: msg.channel_id,
                fail_if_not_exists: true,
            },
        });
    }
});

worker.commands.prefix("/").add({
    command: "init",
    interaction: {
        name: "init",
        description: "init the role thingy",
    },
    exec: async (ctx) => {
        if(!ctx.member || !ctx.member.roles.includes("984647844021551216")) return;
        
        await ctx.reply("ok", true, true);
        await worker.api.messages.send("984654856839135282", {
            content: "",
            embeds: [{
                title: "Click to get roles",
                description: "Select an option to be given that role.",
                color: 0x00FF00,
            }],
            components: components.components,
        });
    },
});

//                 list name, roleID
const roles = new Map<string, string>();

roles.set("supply_chain_management", "984644480168767498");
roles.set("global_logistics_management", "984644528432627742");

roles.set("cips", "984650973769248790");
roles.set("cpim", "984650995843891211");
roles.set("cscp", "984651022662266960");
roles.set("cltd", "984651046523658290");
roles.set("cpsm", "984651066941526088");

roles.set("six-sigma", "984651098851774476");
roles.set("broker", "984651124797755433");

worker.on("INTERACTION_CREATE", async (ir) => {
    if(ir.type !== 3) return;
    if(!ir.member || !ir.guild_id) return;
    if(!roles.has((ir.data as any).values[0])) return;
    
    const role = roles.get((ir.data as any).values[0]) || "";
    
    let content: string;
    
    if(!ir.member.roles.includes(role)) {
        await worker.api.members.addRole(ir.guild_id, ir.member.user.id, role);
        content = `You have been given the role <@&${roles.get((ir.data as any).values[0])}>.`;
    } else {
        await worker.api.members.removeRole(ir.guild_id, ir.member.user.id, role);
        content = `You no longer have the role <@&${roles.get((ir.data as any).values[0])}>.`;
    }
    
    await worker.api.interactions.callback(ir.id, ir.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: content,
            flags: MessageFlags.Ephemeral,
        },
    });
});

worker.start();
