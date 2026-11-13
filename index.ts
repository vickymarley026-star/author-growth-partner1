// Supabase Edge Function. Deploy: supabase functions deploy paystack-webhook --no-verify-jwt
// Secrets: supabase secrets set PAYSTACK_SECRET=sk_... RESEND_KEY=... (RESEND_KEY optional, for emailing codes)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const enc = new TextEncoder();
Deno.serve(async (req) => {
  const body = await req.text();
  const key = await crypto.subtle.importKey("raw", enc.encode(Deno.env.get("PAYSTACK_SECRET")!), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)))).map(b => b.toString(16).padStart(2, "0")).join("");
  if (sig !== req.headers.get("x-paystack-signature")) return new Response("bad signature", { status: 401 });
  const ev = JSON.parse(body);
  if (ev.event !== "charge.success") return new Response("ok");
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ref = ev.data.reference;
  const { data: o } = await db.from("orders").select("*, products(days)").eq("ref", ref).single();
  if (!o || o.status === "paid") return new Response("ok");
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  const code = `${part()}-${part()}-${part()}-${part()}`;
  const exp = new Date(Date.now() + (o.products?.days ?? 30) * 864e5).toISOString();
  await db.from("codes").insert({ code, product_id: o.product_id, expires_at: exp, order_ref: ref });
  await db.from("orders").update({ status: "paid", code }).eq("ref", ref);
  if (Deno.env.get("RESEND_KEY")) await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("RESEND_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Victor Ogomide <onboarding@resend.dev>", to: o.email, subject: "Your activation code", text: `Your tools activation code: ${code}\nValid until ${exp.slice(0, 10)}` }) });
  return new Response("ok");
});
