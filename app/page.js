"use client";

import { useState } from "react";

export default function Home() {
  const [adminKey, setAdminKey] = useState("");
  const [chatId, setChatId] = useState("");
  const [text, setText] = useState("✅ Test gửi tin từ Vercel Webhook");
  const [result, setResult] = useState("Chưa có dữ liệu.");
  const [loading, setLoading] = useState(false);

  const callApi = async (path, body = {}) => {
    setLoading(true);
    setResult("Đang xử lý...");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif", background: "#f3f7fb", minHeight: "100vh" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginTop: 0 }}>Zalo Bot Webhook – Vercel</h1>
        <p>Webhook URL:</p>
        <code style={{ display: "block", background: "#eef2ff", padding: 12, borderRadius: 8, wordBreak: "break-all" }}>
          https://bhook-trungqa.vercel.app/api/webhook
        </code>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <h2>1. Quản trị</h2>
        <label>ADMIN_KEY</label>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Nhập ADMIN_KEY đã đặt trong Vercel"
          style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, margin: "8px 0 14px", boxSizing: "border-box" }}
        />

        <button onClick={() => callApi("/api/get-me")} disabled={loading} style={btnStyle}>Kiểm tra Bot</button>
        <button onClick={() => callApi("/api/set-webhook")} disabled={loading} style={btnStyle}>Cài webhook</button>
        <button onClick={() => callApi("/api/webhook-info")} disabled={loading} style={btnStyle}>Kiểm tra webhook</button>
        <button onClick={() => callApi("/api/delete-webhook")} disabled={loading} style={{ ...btnStyle, background: "#dc2626" }}>Tắt webhook</button>
        <button onClick={() => callApi("/api/debug-env")} disabled={loading} style={{ ...btnStyle, background: "#0f172a" }}>Debug biến</button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <h2>2. Gửi tin nhắn test</h2>
        <label>Chat ID</label>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Dán chat_id nhóm hoặc cá nhân"
          style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, margin: "8px 0 14px", boxSizing: "border-box" }}
        />
        <label>Nội dung</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, margin: "8px 0 14px", minHeight: 100, boxSizing: "border-box" }}
        />
        <button onClick={() => callApi("/api/send", { chat_id: chatId, text })} disabled={loading} style={btnStyle}>
          Gửi tin
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <h2>3. Test chuyển tiếp sang Apps Script</h2>
        <button onClick={() => callApi("/api/test-forward")} disabled={loading} style={{ ...btnStyle, background: "#16a34a" }}>
          Test Vercel → Apps Script
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <h2>4. Kết quả</h2>
        <pre style={{ background: "#0f172a", color: "#e5e7eb", padding: 16, borderRadius: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 160 }}>
          {result}
        </pre>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#0068ff",
  color: "white",
  border: 0,
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
  marginRight: 8,
  marginBottom: 8,
};
