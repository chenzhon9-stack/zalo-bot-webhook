module.exports = async (req, res) => {
  // Chỉ nhận POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  // Kiểm tra secret từ Zalo
  const expected = String(process.env.WEBHOOK_SECRET || "").trim();
  const supplied = String(
    req.headers["x-bot-api-secret-token"] ||
    req.headers["x-webhook-secret"] ||
    ""
  ).trim();

  if (expected && supplied !== expected) {
    console.log(JSON.stringify({
      type: "WEBHOOK_REJECTED",
      at: new Date().toISOString(),
    }));
    return res.status(403).json({
      ok: false,
      error: "Invalid webhook secret",
    });
  }

  // Log nhận được
  console.log(JSON.stringify({
    type: "WEBHOOK_RECEIVED",
    at: new Date().toISOString(),
    body: req.body || null,
  }));

  // Chuyển tiếp sang Google Apps Script
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const forwardSecret = process.env.APPS_SCRIPT_SECRET || process.env.WEBHOOK_SECRET || "";

  if (appsScriptUrl) {
    const forwardPayload = {
      source: "vercel_webhook",
      received_at: new Date().toISOString(),
      forward_secret: forwardSecret,
      data: req.body || {},
    };

    // Gửi bất đồng bộ, không làm chậm phản hồi cho Zalo
    fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(forwardPayload),
    }).catch((err) => {
      console.error("Forward to Apps Script error:", err);
    });
  }

  // Luôn trả 200 ngay cho Zalo
  return res.status(200).json({
    ok: true,
    message: "Webhook received",
  });
};
