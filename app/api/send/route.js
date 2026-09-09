import { NextResponse } from "next/server";

export async function POST(request) {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: "Invalid ADMIN_KEY" }, { status: 401 });
  }

  const body = await request.json();
  const chatId = String(body.chat_id || "").trim();
  const text = String(body.text || "").trim();

  if (!chatId || !text) {
    return NextResponse.json({ ok: false, error: "Missing chat_id or text" }, { status: 400 });
  }

  const token = process.env.BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: "Missing BOT_TOKEN" }, { status: 500 });

  const res = await fetch(`https://bot-api.zaloplatforms.com/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  return NextResponse.json({ ok: res.ok, zalo_response: data });
}
