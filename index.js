const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const MINEFORT_COOKIE = process.env.MINEFORT_COOKIE;
const WORKLOAD_ID = "a84010f1-a343-464d-a482-fa7275b076f6";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => console.log(`Ready: ${client.user.tag}`));

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() !== "!start") return;

  message.channel.send("⏳ Starting server...");
  try {
    const res = await fetch(
      `https://minefort.com/api/v1/workloads/${WORKLOAD_ID}/start`,
      {
        method: "POST",
        headers: {
          "Cookie": MINEFORT_COOKIE,
          "User-Agent": UA,
          "Accept": "*/*",
          "Origin": "https://minefort.com",
          "Referer": "https://minefort.com/dashboard/servers",
        },
      }
    );

    if (res.status === 201 || res.status === 200) {
      message.channel.send("✅ Server is starting!");
    } else {
      const body = await res.text();
      message.channel.send(`❌ Status ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    message.channel.send(`❌ ${err.message}`);
  }
});

client.login(DISCORD_TOKEN);   