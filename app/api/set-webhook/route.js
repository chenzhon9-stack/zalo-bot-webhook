import { NextResponse } from "next/server";

export async function POST(request) {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: "Invalid ADMIN_KEY" }, { status: 401 });
  }

  const token = process.env.BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: "Missing BOT_TOKEN" }, { status: 500 });

  const webhookUrl = "https://bhook-trungqa.vercel.app/api/webhook";
  const secret = process.env.WEBHOOK_SECRET || process.env.APPS_SCRIPT_SECRET || "doi_chuoi_bi_mat_noi_bo_2026";

  const res = await fetch(`https://bot-api.zaloplatforms.com/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, secret_token: secret }),
  });
  const data = await res.json();
  return NextResponse.json({ ok: res.ok, webhook_url: webhookUrl, result: data });
}
