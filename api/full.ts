import { cors, go } from "../lib/stats";

export default {
  async fetch() {
    try {
      return Response.json(await go(), { headers: cors });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return Response.json({ error: msg }, { status: 500, headers: cors });
    }
  },
};
