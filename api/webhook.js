module.exports = async (req, res) => {
  const now = new Date().toISOString();

  // =====================================================
  // 1. CHỈ NHẬN POST
  // =====================================================
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  // =====================================================
  // 2. KIỂM TRA SECRET TỪ ZALO
  // =====================================================
  const expected = String(
    process.env.WEBHOOK_SECRET || ""
  ).trim();

  const supplied = String(
    req.headers["x-bot-api-secret-token"] ||
    req.headers["x-webhook-secret"] ||
    ""
  ).trim();

  if (expected && supplied !== expected) {
    console.log(JSON.stringify({
      type: "WEBHOOK_REJECTED",
      at: now,
    }));

    return res.status(403).json({
      ok: false,
      error: "Invalid webhook secret",
    });
  }

  // =====================================================
  // 3. LẤY BODY ZALO
  // =====================================================
  const zaloBody = req.body || {};

  console.log(JSON.stringify({
    type: "WEBHOOK_RECEIVED",
    at: now,
    method: req.method,
    event_name: zaloBody.event_name || "",
    body: zaloBody,
  }));

  // =====================================================
  // 4. KIỂM TRA CẤU HÌNH APPS SCRIPT
  // =====================================================
  const appsScriptUrl = String(
    process.env.APPS_SCRIPT_URL || ""
  ).trim();

  const forwardSecret = String(
    process.env.APPS_SCRIPT_SECRET ||
    process.env.WEBHOOK_SECRET ||
    ""
  ).trim();

  console.log(JSON.stringify({
    type: "FORWARD_CONFIG",
    at: new Date().toISOString(),
    appsScriptConfigured: !!appsScriptUrl,
    forwardSecretConfigured: !!forwardSecret,
  }));

  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL chưa được cấu hình");

    return res.status(500).json({
      ok: false,
      error: "APPS_SCRIPT_URL is not configured",
    });
  }

  // =====================================================
  // 5. ĐÓNG GÓI DỮ LIỆU CHUYỂN SANG APPS SCRIPT
  // =====================================================
  const forwardPayload = {
    source: "vercel_webhook",
    received_at: new Date().toISOString(),
    forward_secret: forwardSecret,
    data: zaloBody,
  };

  // =====================================================
  // 6. FORWARD SANG GOOGLE APPS SCRIPT
  //
  // QUAN TRỌNG:
  // Phải await fetch()
  // =====================================================
  try {
    console.log(JSON.stringify({
      type: "FORWARD_START",
      at: new Date().toISOString(),
    }));

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(forwardPayload),
    });

    const responseText = await response.text();

    console.log(JSON.stringify({
      type: "FORWARD_RESULT",
      at: new Date().toISOString(),
      status: response.status,
      ok: response.ok,
      response: responseText.slice(0, 1000),
    }));

  } catch (err) {

    console.error(JSON.stringify({
      type: "FORWARD_ERROR",
      at: new Date().toISOString(),
      error: String(err.message || err),
    }));

    // Vẫn trả 200 cho Zalo để tránh Zalo retry liên tục.
    return res.status(200).json({
      ok: true,
      received: true,
      forwarded: false,
      error: "Forward to Apps Script failed",
    });
  }

  // =====================================================
  // 7. TRẢ 200 CHO ZALO
  // =====================================================
  return res.status(200).json({
    ok: true,
    received: true,
    forwarded: true,
  });
};
