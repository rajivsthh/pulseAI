import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const PULSE_AI_PROMPT = `You are Pulse AI, an advanced 'News-to-Shorts' content engine. You specialize in transforming complex global technology updates into short, engaging educational concepts and scripts optimized for TikTok, Instagram Reels, and YouTube Shorts.

When responding, you should:
- Explain tech discoveries with clarity: reference discovery sources, verification steps, and real-world impact.
- Suggest video concepts: outline how a specific piece of news can be distilled into a 60-second engaging script.
- Address verification: emphasize accuracy and responsible AI practices in content distillation.
- Localize the impact: explain why this news matters to students, self-learners, and innovators.
- Blend scientific accuracy with digital storytelling brilliance.

Enhanced context: PulseAI automates discovery, verification, and script distillation to produce ready-to-post short-form videos. It bridges the information and production gaps for technology news.`;

const SUGGESTED_PROMPTS = [
  { icon: "🎬", text: "What's the latest in AI research and how can we make it viral?" },
  { icon: "🚀", text: "Draft a 60-second script about NASA's newest discovery" },
  { icon: "🧠", text: "Explain the newest neural network breakthrough for a general audience" },
  { icon: "📱", text: "How can we turn today's tech trends into a learning experience?" },
];

const GradientOrb = ({ style }: { style: React.CSSProperties }) => (
  <div style={{
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.15,
    pointerEvents: "none",
    ...style,
  }} />
);

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "linear-gradient(135deg, #4fc3f7, #7c4dff)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

function Message({ msg }: { msg: { role: string; content: string } }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 20,
      animation: "fadeSlideIn 0.3s ease-out",
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #4fc3f7 0%, #7c4dff 50%, #e040fb 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 12, marginTop: 2, fontSize: 16,
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser
          ? "linear-gradient(135deg, #1e2a3a 0%, #162035 100%)"
          : "transparent",
        borderRadius: isUser ? "20px 20px 4px 20px" : "0",
        padding: isUser ? "12px 18px" : "4px 0",
        border: isUser ? "1px solid rgba(79,195,247,0.15)" : "none",
      }}>
        <p style={{
          margin: 0, color: isUser ? "#e8f4fd" : "#c9d8e8",
          fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap",
          fontFamily: "'Georgia', serif",
        }}>{msg.content}</p>
      </div>
    </div>
  );
}

function Index() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
  };

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setShowSuggestions(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Note: This API call requires an Anthropic API key.
      // In a real application, this should be handled by a backend service.
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY", // Placeholder
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          system: PULSE_AI_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((b: any) => b.text || "").join("") || "No response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080d14",
      display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%,100% { opacity: 0.15; } 50% { opacity: 0.25; } }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: rgba(79,195,247,0.3); border-radius: 4px; }
        .send-btn:hover { background: linear-gradient(135deg, #29b6f6, #7c4dff) !important; transform: scale(1.05); }
        .send-btn:active { transform: scale(0.97); }
        .suggestion:hover { background: rgba(79,195,247,0.1) !important; border-color: rgba(79,195,247,0.4) !important; transform: translateY(-2px); }
        .suggestion { transition: all 0.2s ease; }
        textarea:focus { outline: none !important; }
        .input-wrap:focus-within { border-color: rgba(79,195,247,0.5) !important; box-shadow: 0 0 0 1px rgba(79,195,247,0.2), 0 8px 32px rgba(0,0,0,0.4) !important; }
      `}</style>

      {/* Background orbs */}
      <GradientOrb style={{ width: 600, height: 600, top: -200, left: -100, background: "radial-gradient(circle, #4fc3f7, transparent)", animation: "pulse 6s ease-in-out infinite" }} />
      <GradientOrb style={{ width: 500, height: 500, bottom: -150, right: -100, background: "radial-gradient(circle, #7c4dff, transparent)", animation: "pulse 8s ease-in-out 2s infinite" }} />
      <GradientOrb style={{ width: 300, height: 300, top: "40%", left: "40%", background: "radial-gradient(circle, #e040fb, transparent)", animation: "pulse 10s ease-in-out 4s infinite" }} />

      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)", background: "rgba(8,13,20,0.8)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img 
            src={logo} 
            alt="Pulse AI Logo" 
            style={{ 
              height: 48, 
              width: "auto", 
              objectFit: "contain",
              mixBlendMode: "screen",
              filter: "brightness(1.2)",
              transition: "all 0.3s ease"
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling!.setAttribute('style', 'display: flex; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4fc3f7, #7c4dff, #e040fb); align-items: center; justify-content: center; font-size: 24px; animation: float 4s ease-in-out infinite;');
            }}
          />
          <div style={{
            display: "none", // Hidden by default, shown if image fails
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #4fc3f7, #7c4dff, #e040fb)",
            alignItems: "center", justifyContent: "center",
            fontSize: 24, animation: "float 4s ease-in-out infinite",
          }}>✦</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["⚡ News Scanner", "🎬 Shorts Mode"].map(label => (
            <div key={label} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12,
              background: "rgba(79,195,247,0.08)", border: "1px solid rgba(79,195,247,0.2)",
              color: "#7dd3fc", cursor: "pointer",
            }}>{label}</div>
          ))}
        </div>
      </header>

      {/* Chat area */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>

          {/* Welcome / hero */}
          {showSuggestions && messages.length === 0 && (
            <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeSlideIn 0.6s ease-out" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
                background: "linear-gradient(135deg, #4fc3f7, #7c4dff, #e040fb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, animation: "float 3s ease-in-out infinite",
                boxShadow: "0 0 60px rgba(124,77,255,0.4)",
              }}>✦</div>
              <h1 style={{
                fontSize: 38, fontWeight: 700, margin: "0 0 12px",
                background: "linear-gradient(135deg, #e8f4fd 0%, #7dd3fc 50%, #c4b5fd 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
              }}>Hello, Explorer</h1>
              <p style={{ color: "#6b8ba4", fontSize: 17, margin: "0 0 40px", lineHeight: 1.6 }}>
                Transforming global technology news into<br />engaging short-form educational content.
              </p>

              {/* Suggestion chips */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {SUGGESTED_PROMPTS.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => sendMessage(s.text)} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "16px 18px", textAlign: "left", cursor: "pointer",
                    color: "#c9d8e8", display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#8fadbf" }}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 20, animation: "fadeSlideIn 0.3s ease-out" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #4fc3f7, #7c4dff, #e040fb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 12, fontSize: 16,
              }}>✦</div>
              <div style={{ padding: "10px 0" }}><TypingDots /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input area */}
      <div style={{
        padding: "16px 20px 24px", background: "rgba(8,13,20,0.9)", backdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="input-wrap" style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, display: "flex", alignItems: "flex-end",
            padding: "12px 14px 12px 20px", gap: 10, transition: "all 0.2s ease",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
              placeholder="Ask about tech news, video concepts, trends..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", resize: "none",
                color: "#e8f4fd", fontSize: 15, lineHeight: 1.6, padding: 0,
                fontFamily: "inherit", caretColor: "#4fc3f7", maxHeight: 160,
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: "50%", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #4fc3f7, #7c4dff)"
                  : "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.2s ease", flexShrink: 0,
                color: input.trim() && !loading ? "white" : "#4a6478",
              }}
            >↑</button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#2d4a5e", marginTop: 10 }}>
            Pulse AI · Powered by News-to-Shorts content engine · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
