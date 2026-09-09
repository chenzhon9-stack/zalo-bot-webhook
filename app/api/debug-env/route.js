import { NextResponse } from "next/server";

export async function POST(request) {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: "Invalid ADMIN_KEY" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    env: {
      has_bot_token: !!process.env.BOT_TOKEN,
      has_admin_key: !!process.env.ADMIN_KEY,
      has_webhook_secret: !!process.env.WEBHOOK_SECRET,
      has_apps_script_url: !!process.env.APPS_SCRIPT_URL,
      has_apps_script_secret: !!process.env.APPS_SCRIPT_SECRET,
      bot_token_length: String(process.env.BOT_TOKEN || "").trim().length,
      admin_key_length: String(process.env.ADMIN_KEY || "").trim().length,
      apps_script_url_preview: process.env.APPS_SCRIPT_URL
        ? process.env.APPS_SCRIPT_URL.substring(0, 50) + "..."
        : "",
    },
  });
}
