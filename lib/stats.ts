const token = process.env.SLACK_API_TOKEN;
const cookie = process.env.SLACK_API_COOKIE;

const TTL = 10 * 60 * 1000;
let cache: { data: unknown; ts: number } | null = null;

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "s-maxage=600, stale-while-revalidate=60",
};

export async function go() {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;
  if (!token) throw new Error("SLACK_API_TOKEN is not set");

  const b = "orpheus";
  const body = [
    `--${b}`, `Content-Disposition: form-data; name="token"`, "", token,
    `--${b}`, `Content-Disposition: form-data; name="date_range"`, "", "28d",
    `--${b}`, `Content-Disposition: form-data; name="team_id"`, "", "T0266FRGM",
    `--${b}--`,
  ].join("\r\n");

  const headers: Record<string, string> = {
    "content-type": `multipart/form-data; boundary=${b}`,
  };
  if (cookie) {
    const encoded = encodeURIComponent(cookie.startsWith("d=") ? cookie.slice(2) : cookie);
    headers["cookie"] = `d=${encoded}`;
  }

  const res = await fetch("https://hackclub.slack.com/api/team.stats.timeSeries", {
    method: "POST", headers, body,
  });

  const json = (await res.json()) as {
    ok: boolean; stats?: Record<string, unknown>[]; membership?: unknown;
    available_date_range?: unknown; computed_ts?: number; error?: string;
  };

  if (!json.ok)
    throw new Error(json.error ?? "No stats returned from Slack API");

  const { ok, error, ...data } = json;
  cache = { data, ts: Date.now() };
  return data;
}
