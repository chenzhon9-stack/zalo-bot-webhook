import { NextResponse } from "next/server";

export async function POST(request) {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false, error: "Invalid ADMIN_KEY" }, { status: 401 });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const forwardSecret = process.env.APPS_SCRIPT_SECRET || "doi_chuoi_bi_mat_noi_bo_2026";

  if (!appsScriptUrl) {
    return NextResponse.json({ ok: false, error: "Missing APPS_SCRIPT_URL" }, { status: 500 });
  }

  const testPayload = {
    source: "vercel_test_forward",
    received_at: new Date().toISOString(),
    forward_secret: forwardSecret,
    data: {
      ok: true,
      result: {
        update_id: "VERCEL_TEST_" + Date.now(),
        message: {
          message_id: "VERCEL_TEST_MSG_" + Date.now(),
          text: "/id",
          chat: {
            id: "VERCEL_TEST_CHAT_ID",
            type: "private",
            title: "Vercel test chat",
          },
          from: {
            id: "VERCEL_TEST_FROM_ID",
            name: "Vercel Test User",
          },
        },
      },
    },
  };

  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(testPayload),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = { raw: text };
    }

    return NextResponse.json({
      ok: res.ok,
      forwarded_to_apps_script: true,
      apps_script_status: res.status,
      apps_script_response: json,
      sent_payload: testPayload,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err.message || err),
    }, { status: 500 });
  }
}
