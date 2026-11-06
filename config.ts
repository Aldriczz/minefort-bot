import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const config = {
  discordToken: requireEnv("DISCORD_TOKEN"),
//   ownerId: requireEnv("ALLOWED_USER_ID"),
} as const;