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
  { icon: "🚀", text: "Draft a 60-second script about NASA's newest space discovery" },
  { icon: "📈", text: "What are the top 3 tech trends in Asia for innovators today?" },
  { icon: "🔥", text: "Suggest 5 viral hooks for a video about the future of green energy" },
  { icon: "✅", text: "Verify this claim: 'New AI can predict volcanic eruptions with 95% accuracy'" },
];

const SidebarItem = ({ title, date }: { title: string; date: string }) => (
  <div style={{
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "4px",
    border: "1px solid transparent",
  }} className="sidebar-item">
    <div style={{ fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "4px" }}>{title}</div>
    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{date}</div>
  </div>
);

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#4fc3f7",
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
      marginBottom: 24,
      animation: "fadeSlideIn 0.3s ease-out",
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "12px", flexShrink: 0,
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 14, marginTop: 4, fontSize: 18, color: "white",
          boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "80%",
        background: isUser ? "#f1f5f9" : "transparent",
        borderRadius: isUser ? "16px 16px 4px 16px" : "0",
        padding: isUser ? "14px 20px" : "8px 0",
        boxShadow: isUser ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
      }}>
        <p style={{
          margin: 0, color: isUser ? "#1e293b" : "#475569",
          fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap",
          fontFamily: "'Inter', sans-serif",
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": "YOUR_API_KEY",
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
      minHeight: "100vh", background: "#ffffff",
      display: "flex", fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .send-btn:hover { background: #0ea5e9 !important; transform: scale(1.05); }
        .send-btn:active { transform: scale(0.97); }
        .sidebar-item:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .suggestion:hover { background: #f8fafc !important; border-color: #0ea5e9 !important; transform: translateY(-2px); }
        .suggestion { transition: all 0.2s ease; }
        textarea:focus { outline: none !important; }
        .input-wrap:focus-within { border-color: #0ea5e9 !important; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.1) !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 300,
        borderRight: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        background: "#ffffff",
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 32, padding: "0 8px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20 }}>
            Story History
          </h2>
          <SidebarItem title="NASA Space Discovery" date="Today, 10:45 AM" />
          <SidebarItem title="AI Research Viral Hook" date="Yesterday, 4:20 PM" />
          <SidebarItem title="Global Tech Trends" date="Oct 14, 2023" />
          <SidebarItem title="Neural Network Script" date="Oct 12, 2023" />
        </div>
        <div style={{ marginTop: "auto", padding: "16px", background: "#f8fafc", borderRadius: "16px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
            Upgrade to <strong>Pulse Pro</strong> for unlimited script generation and RAG verification.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", borderBottom: "1px solid #f1f5f9",
          background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img 
              src={logo} 
              alt="Pulse AI Logo" 
              style={{ height: 48, width: "auto", objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling!.setAttribute('style', 'display: flex; width: 48px; height: 48px; border-radius: 12px; background: #0ea5e9; align-items: center; justify-content: center; font-size: 24px; color: white;');
              }}
            />
            <div style={{ display: "none" }}>✦</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["⚡ News Scanner", "🎬 Shorts Mode"].map(label => (
              <div key={label} style={{
                padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                background: "#f1f5f9", border: "1px solid #e2e8f0",
                color: "#475569", cursor: "pointer", transition: "all 0.2s",
              }}>{label}</div>
            ))}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "40px 0" }}>
          <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 40px" }}>

            {showSuggestions && messages.length === 0 && (
              <div style={{ textAlign: "center", marginBottom: 64, animation: "fadeSlideIn 0.6s ease-out" }}>
                <h1 style={{
                  fontSize: 42, fontWeight: 800, margin: "0 0 16px",
                  color: "#1e293b", letterSpacing: "-1.5px",
                }}>Hello, Explorer</h1>
                <p style={{ color: "#64748b", fontSize: 18, margin: "0 0 48px", lineHeight: 1.6, maxWidth: 500, marginInline: "auto" }}>
                  Transforming global technology news into engaging short-form educational content.
                </p>

                {/* Suggestion chips */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {SUGGESTED_PROMPTS.map((s, i) => (
                    <button key={i} className="suggestion" onClick={() => sendMessage(s.text)} style={{
                      background: "#ffffff", border: "1px solid #e2e8f0",
                      borderRadius: "20px", padding: "24px", textAlign: "left", cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    }}>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <span style={{ fontSize: 14, lineHeight: 1.5, color: "#334155", fontWeight: 500 }}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24, animation: "fadeSlideIn 0.3s ease-out" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "12px", flexShrink: 0,
                  background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: 14, color: "white", fontSize: 18,
                }}>✦</div>
                <div style={{ padding: "10px 0" }}><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <div style={{
          padding: "24px 40px 40px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
        }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <div className="input-wrap" style={{
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderRadius: "24px", display: "flex", alignItems: "flex-end",
              padding: "16px 16px 16px 24px", gap: 12, transition: "all 0.2s ease",
              boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
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
                  color: "#1e293b", fontSize: 16, lineHeight: 1.6, padding: 0,
                  fontFamily: "inherit", caretColor: "#0ea5e9", maxHeight: 160,
                }}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 44, height: 44, borderRadius: "14px", border: "none", 
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  background: input.trim() && !loading ? "#0ea5e9" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, transition: "all 0.2s ease", flexShrink: 0,
                  color: input.trim() && !loading ? "white" : "#94a3b8",
                }}
              >↑</button>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 14 }}>
              Pulse AI · Powered by News-to-Shorts content engine · Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
