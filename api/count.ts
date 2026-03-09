import { cors, go } from "../lib/stats";

export default {
  async fetch() {
    try {
      const data = (await go()) as any;
      return Response.json({ count: data.membership.total_members.number }, { headers: cors });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return Response.json({ error: msg }, { status: 500, headers: cors });
    }
  },
};
