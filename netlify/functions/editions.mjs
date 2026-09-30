import { getStore } from "@netlify/blobs";
import { createHandler } from "../lib/editions.mjs";
export default async (request, runtime) => {
  const context = runtime?.deploy?.context || "dev";
  const store = getStore({
    name:
      context === "production"
        ? "collector-editions"
        : "collector-editions-" +
          context +
          "-" +
          (runtime?.deploy?.id || "local").replace(/[^a-z0-9-]/gi, "-"),
    consistency: "strong",
  });
  return createHandler({
    store,
    send: async (message) => {
      if (!process.env.RESEND_API_KEY)
        throw Error("RESEND_API_KEY is not configured");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Talmon de l’Armée Photography <studio@updates.claytontalmon.com>",
          reply_to: "ctalmon@gmail.com",
          ...message,
        }),
      });
      if (!res.ok) throw Error("Email delivery failed: " + res.status);
    },
  })(request);
};
