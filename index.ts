const { Client, GatewayIntentBits } = require("discord.js");
const { execFile } = require("child_process");
const { config } = require("./config.ts");
const { COMMANDS, MESSAGES, URLS } = require("./constants.ts");
import type { RequestResult, Workload } from "./interface.ts";

// ---------- Config ----------
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const MINEFORT_COOKIE = process.env.MINEFORT_COOKIE;
const ALLOWED_USER_ID = process.env.ALLOWED_USER_ID; // optional: only this Discord user can use !start
const WORKLOAD_ID = "";

if (!DISCORD_TOKEN || !MINEFORT_COOKIE) {
  console.error("Missing DISCORD_TOKEN or MINEFORT_COOKIE in .env");
  process.exit(1);
}

// ---------- Discord bot ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const HEADERS = {
  "Cookie": MINEFORT_COOKIE,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://minefort.com",
  "Referer": "https://minefort.com/dashboard/servers",
  "sec-ch-ua": "Not:A-Brand;v=8, Chromium;v=156, Brave;v=156",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "Windows",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
};

async function makeRequest(URL: string, method = "POST", successMessage = "", failureMessage = "") : Promise< RequestResult > {
  const args = ["-s", "-X", method, URL, "-w", "\n%{http_code}"];
  for (const [key, value] of Object.entries(HEADERS)) {
    args.push("-H", `${key}: ${value}`);
  }

  const { status , body } : { status: number; body: string; } = await new Promise((resolve, reject) => {
    execFile("curl", args, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err: any, stdout: string) => {
      if (err) return reject(err);
      const idx = stdout.lastIndexOf("\n");
      resolve({
        status: parseInt(stdout.slice(idx + 1), 10),
        body: stdout.slice(0, idx),
      });
    });
  });
  return checkRequestResponse(successMessage, failureMessage, status, body);
}

function parseResponseBody(body: string): Workload[] {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed.data.workloads as Workload[] || [];
    }
  } catch (error) {
    console.error("Error parsing response body:", error);
  }
  return [];
}

async function getAllServers(message: any) : Promise<RequestResult> {
  const res : RequestResult = await makeRequest(URLS.getAll(), "GET", MESSAGES.SERVER_GET_ALL_SUCCESS, MESSAGES.SERVER_GET_ALL_FAILURE);
  const workloads : Workload[] = parseResponseBody(res.body as string);
  if (workloads.length == 0){
    return {message: MESSAGES.SERVER_GET_ALL_EMPTY, status: res.status, body: []};
  }
  else{
    let serverList = "Servers:\n";
    serverList = workloads.map((workload, idx) => `${idx + 1}. ${workload.name}, State: ${workload.state}`).join("\n");
    message.channel.send(serverList);
    res.body = workloads.map((workload) => `${workload.id}`);
  }
  return res;
}

async function chooseServer(message: any) : Promise< string | null > {
  const res : RequestResult = await getAllServers(message);

  const filter = (m : any) => m.author.id === message.author.id;

  try {
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
      errors: ["time"],
    });
 
    const choice = parseInt(collected.first().content, 10);
    if (!choice || choice < 1 || choice > res.body.length) {
      return message.channel.send(MESSAGES.NOT_VALID_OPTION);
    }
 
    const selected = res.body[choice - 1];
    console.log(`User selected server: ${selected}`);
    return selected;
  } catch {
    message.channel.send(MESSAGES.TIME_OUT_OPTION);
  }
  return null;
}

async function wakeServer(message: any) : Promise<RequestResult> {
  const selectedId = await chooseServer(message);

  if(!selectedId) {
    return {message: MESSAGES.NOT_VALID_OPTION, status: 400, body: []};
  }

  return await makeRequest(URLS.wake(selectedId), "POST", MESSAGES.SERVER_WAKE_SUCCESS, MESSAGES.SERVER_WAKE_FAILURE);
}

async function startServer(message: any) : Promise<RequestResult> {
  const selectedId = await chooseServer(message);

  if(!selectedId) {
    return {message: MESSAGES.NOT_VALID_OPTION, status: 400, body: []};
  }

  return await makeRequest(URLS.wake(selectedId), "POST", MESSAGES.SERVER_START_SUCCESS, MESSAGES.SERVER_START_FAILURE);
}
 
async function checkMessageContent(content: string, message: any) : Promise<RequestResult> {
  switch (content) {
    case "!getall":
      return await getAllServers(message);
    case "!wake":
      return await wakeServer(message);
    case "!start":
      return await startServer(message);
    case "!stop":
      break
    case "!sleep":
      break;
    case "!restart":
      break;
    case "!help":
      return {message: "Commands:\n !wake - Wake the server\n !start - Start the server\n", status: 200, body: []};
    default:
      return {message: "Unknown command. Type !help for a list of commands.", status: 400, body: []};
  }
  return {message: "Command not implemented yet.", status: 400, body: []};
}

function checkRequestResponse(successMessage: string, failureMessage: string, status: number, body: string | string[]) : RequestResult {
  if (status >= 200 && status < 300) {
    return {message: successMessage, status, body};
  } 
  // cloudflare protection
  else if (status === 403 && body.includes("Just a moment")) {
    return {message: failureMessage, status, body};
  }
  // unauthorized
  else if (status === 401 || status === 403) {
    return {message: failureMessage, status, body};
  }
  // other errors
  else {
    return {message: failureMessage, status, body};
  }
}


client.once("ready", () => console.log(`Ready: ${client.user.tag}`));

client.on("messageCreate", async (message: { author: { bot: any; id: string; }; content: string; channel: { send: (arg0: string) => void; }; }) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const content = message.content.trim().toLowerCase();

  if (ALLOWED_USER_ID && message.author.id !== ALLOWED_USER_ID) {
    return message.channel.send("⛔ You're not allowed to use this command.");
  }

  try {
    const {message: resultMessage, status, body} = await checkMessageContent(content, message);

    message.channel.send(resultMessage);

  } catch (err : any) {
    await message.channel.send(`❌ ${err.message}`);
  }
});

client.login(DISCORD_TOKEN);