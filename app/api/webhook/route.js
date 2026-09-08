export async function POST(request) {
  try {
    const bodyText = await request.text();
    let data = {};

    try {
      data = bodyText ? JSON.parse(bodyText) : {};
    } catch (err) {
      data = { raw: bodyText };
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const forwardSecret = process.env.APPS_SCRIPT_SECRET || "doi_chuoi_bi_mat_noi_bo_2026";

    if (!appsScriptUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing APPS_SCRIPT_URL" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const forwardPayload = {
      source: "vercel_webhook",
      received_at: new Date().toISOString(),
      forward_secret: forwardSecret,
      data: data,
    };

    // Gửi sang Apps Script (không đợi để trả lời Zalo nhanh)
    fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(forwardPayload),
    }).catch((err) => {
      console.error("Forward to Apps Script error:", err);
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Webhook received and forwarded",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err.message || err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Zalo Bot webhook is running on Vercel",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
}
