export const MINEFORT_API = "https://minefort.com/api/v1";
export const REQUEST_TIMEOUT_MS = 30000;
export const COOLDOWN_MS = 30000;

export const COMMANDS = {
  START: "!start",
  SET_COOKIE: "!setcookie",
  COOKIE_STATUS: "!cookiestatus",
} as const;

export const MESSAGES = {
  //start
  SERVER_START_SUCCESS: "✅ Server is starting!",
  SERVER_START_FAILURE: "❌ Failed to start server.",
  //wake
  SERVER_WAKE_SUCCESS: "✅ Server is waking up!",
  SERVER_WAKE_FAILURE: "❌ Failed to wake server.",
  //sleep
  SERVER_SLEEP_SUCCESS: "✅ Server is sleeping!",
  SERVER_SLEEP_FAILURE: "❌ Failed to sleep server.",
  //restart
  SERVER_RESTART_SUCCESS: "✅ Server is restarting!",
  SERVER_RESTART_FAILURE: "❌ Failed to restart server.",
  //stop
  SERVER_STOP_SUCCESS: "✅ Server is stopping!",
  SERVER_STOP_FAILURE: "❌ Failed to stop server.",
  //getall
  SERVER_GET_ALL_SUCCESS: "✅ Successfully retrieved all servers!",
  SERVER_GET_ALL_FAILURE: "❌ Failed to retrieve all servers.",
  SERVER_GET_ALL_EMPTY: "❌ No servers found.",

  NOT_VALID_OPTION: "❌ Not a valid option.",
  TIME_OUT_OPTION: "⏱️ Waktu habis, slowhand bgt jirlah.",
} as const;

export const URLS = {
  wake: (workloadId: string) => `${MINEFORT_API}/workloads/${workloadId}/wake`,
  start: (workloadId: string) => `${MINEFORT_API}/workloads/${workloadId}/start`,
  sleep: (workloadId: string) => `${MINEFORT_API}/workloads/${workloadId}/sleep`,
  stop: (workloadId: string) => `${MINEFORT_API}/workloads/${workloadId}/stop`,
  restart: (workloadId: string) => `${MINEFORT_API}/workloads/${workloadId}/restart`,
  getAll: () => `${MINEFORT_API}/workloads`,
} as const;








































































































































































































































































export const wn  =  {
    "ws": "gw pengen cipok dan genjod winsen"
}