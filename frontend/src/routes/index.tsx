import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bell, Mic, Link as LinkIcon, Sparkles, Send, History, Video, Zap, Search, Menu, X, ChevronRight, ChevronLeft, Plus, User, Upload } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import pulsevdo from "@/assets/pulsevdo.mp4";
import vdo2 from "@/assets/vdo2.mp4";
import avatarPlaceholder from "@/assets/image.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const PULSE_AI_PROMPT = `You are Pulse AI, an advanced 'News-to-Shorts' content engine. You specialize in transforming complex global technology updates into short, engaging educational concepts and scripts optimized for TikTok, Instagram Reels, and YouTube Shorts.

When responding, you should:
- Explain tech discoveries with clarity: reference discovery sources, verification steps, and real-world impact.
- Suggest video concepts: outline how a specific piece of news can be distilled into a 60-second engaging script.
- Address verification: emphasize accuracy and responsible AI practices in content distillation.
- Localize the impact: explain why this news matters to students, self-learners, and innovators.
- Blend scientific accuracy with digital storytelling brilliance.`;

const SUGGESTED_PROMPTS = [
  { icon: "🛸", category: "Space", text: "Draft a 60-second script about NASA's newest space discovery", color: "#0ea5e9" },
  { icon: "🤖", category: "AI", text: "What are the latest breakthroughs in neural network efficiency?", color: "#8b5cf6" },
  { icon: "🔋", category: "Future", text: "Suggest 5 viral hooks for a video about next-gen solid state batteries", color: "#10b981" },
  { icon: "📈", category: "Trends", text: "What tech trends are currently dominating the Nepalese market?", color: "#f59e0b" },
];

const SidebarItem = ({ title, date, icon: Icon }: { title: string; date: string; icon: any }) => (
  <div style={{
    padding: "12px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "6px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }} className="sidebar-item">
    <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={16} color="#64748b" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#334155", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>{date}</div>
    </div>
  </div>
);

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#0ea5e9",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }: { msg: { role: string; content: string | { type: "image" | "video" | "pdf"; src: string; name?: string } } }) {
  const isUser = msg.role === "user";
  const content = msg.content;
  const isFile = typeof content !== "string";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 28,
      animation: "fadeSlideIn 0.3s ease-out",
    }}>
      {!isUser && (
        <div style={{
          width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 16, marginTop: 4, fontSize: 20, color: "white",
          boxShadow: "0 8px 16px rgba(14, 165, 233, 0.2)",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "80%",
        background: isUser ? "#f1f5f9" : "transparent",
        borderRadius: isUser ? "18px 18px 4px 18px" : "0",
        padding: isUser ? "16px 22px" : "8px 0",
        boxShadow: isUser ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        border: isUser ? "1px solid rgba(0,0,0,0.05)" : "none",
      }}>
        {typeof content === 'string' ? (
          <p style={{
            margin: 0, color: isUser ? "#334155" : "#475569",
            fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap",
            fontFamily: "'Inter', sans-serif",
          }}>{content}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {content.type === 'image' && <img src={content.src} alt={content.name || 'image'} style={{ maxWidth: '100%', borderRadius: 12 }} />}
            {content.type === 'video' && <video src={content.src} controls style={{ maxWidth: '100%', borderRadius: 12 }} />}
            {content.type === 'pdf' && (
              <a href={content.src} download={content.name} style={{ color: '#0ea5e9', textDecoration: 'underline' }}>{content.name || 'Download PDF'}</a>
            )}
            {content.name && <div style={{ fontSize: 12, color: '#64748b' }}>{content.name}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Index() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string | { type: "image" | "video" | "pdf"; src: string; name?: string } }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [mode, setMode] = useState<"scanner" | "shorts" | "blank">("shorts");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentVdo, setCurrentVdo] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const videos = [
    { src: pulsevdo, prompt: "A cinematic short-form concept generated from latest tech news..." },
    { src: vdo2, prompt: "Next-gen AI verification workflow for viral content creation..." }
  ];
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
              messages: newMessages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : `[file:${(m.content as any).name || 'attachment'}]` })),
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
      height: "100vh", background: "#f8fafc",
      display: "flex", fontFamily: "'Inter', sans-serif", color: "#334155", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .sidebar-item:hover { background: #f1f5f9; }
        .suggestion:hover { transform: translateY(-4px); border-color: #0ea5e9 !important; background: rgba(14, 165, 233, 0.05) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .suggestion { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .mode-toggle:hover { background: rgba(0,0,0,0.02); }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: isSidebarOpen ? 320 : 0,
        opacity: isSidebarOpen ? 1 : 0,
        borderRight: isSidebarOpen ? "1px solid rgba(0,0,0,0.05)" : "none",
        display: "flex",
        flexDirection: "column",
        padding: isSidebarOpen ? "32px 20px" : "32px 0",
        background: "#ffffff",
        flexShrink: 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}>
        <div style={{ marginBottom: 40, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingLeft: "14px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>
              My Scripts
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>
          <SidebarItem title="NASA Space Discovery" date="10:45 AM" icon={Zap} />
          <SidebarItem title="Next-Gen Neural Nets" date="Yesterday" icon={Video} />
          <SidebarItem title="Fusion Energy Hook" date="Oct 14" icon={Zap} />
          <SidebarItem title="TikTok Tech Trends" date="Oct 12" icon={History} />
        </div>

        <div style={{ marginTop: "auto" }}>
          <button style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
            borderRadius: "14px",
            border: "none",
            color: "white",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 10px 20px rgba(14, 165, 233, 0.2)",
          }}>
            <Sparkles size={18} /> Upgrade to Pulse Pro
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 40px", borderBottom: "1px solid rgba(0,0,0,0.05)",
          background: "#ffffff",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                  transition: "all 0.2s",
                }}
                title="Open Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <img
              src={logo}
              alt="Pulse AI Logo"
              style={{
                height: 110,
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "12px",
              display: "flex",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              <button
                onClick={() => setMode("blank")}
                style={{
                  padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: mode === "blank" ? "#ffffff" : "transparent",
                  boxShadow: mode === "blank" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  color: mode === "blank" ? "#0ea5e9" : "#64748b", transition: "all 0.2s"
                }}
              >
                <User size={16} /> Choose your avatar
              </button>
              <button
                onClick={() => setMode("scanner")}
                style={{
                  padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: mode === "scanner" ? "#ffffff" : "transparent",
                  boxShadow: mode === "scanner" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  color: mode === "scanner" ? "#0ea5e9" : "#64748b", transition: "all 0.2s"
                }}
              >
                <Search size={16} /> News Scanner
              </button>
              <button
                onClick={() => setMode("shorts")}
                style={{
                  padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: mode === "shorts" ? "#ffffff" : "transparent",
                  boxShadow: mode === "shorts" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  color: mode === "shorts" ? "#0ea5e9" : "#64748b",
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                <Video size={14} /> Shorts Mode
              </button>
            </div>

            <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", position: "relative" }}>
              <Bell size={20} />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #080d14" }} />
            </button>
          </div>
        </header>

        {/* Live Ticker */}
        <div style={{
          background: "rgba(14, 165, 233, 0.05)",
          borderBottom: "1px solid rgba(14, 165, 233, 0.1)",
          padding: "10px 0",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}>
          <div style={{ display: "inline-block", animation: "ticker 30s linear infinite", paddingLeft: "100%" }}>
            <span style={{ color: "#0ea5e9", fontWeight: 700, marginRight: "40px" }}>BREAKING:</span>
            <span style={{ marginRight: "80px", color: "#94a3b8" }}>SpaceX Starship achieves successful orbital insertion test...</span>
            <span style={{ color: "#0ea5e9", fontWeight: 700, marginRight: "40px" }}>VERIFIED:</span>
            <span style={{ marginRight: "80px", color: "#94a3b8" }}>New deepfake detection AI reaches 99.9% accuracy...</span>
            <span style={{ color: "#0ea5e9", fontWeight: 700, marginRight: "40px" }}>TRENDING:</span>
            <span style={{ color: "#94a3b8" }}>Room-temperature superconductor replication attempts increase globally...</span>
          </div>
        </div>

        <main style={{
          flex: 1,
          overflowY: messages.length === 0 || mode === "blank" ? "hidden" : "auto",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 40px", width: "100%" }}>

            {mode !== "blank" && showSuggestions && messages.length === 0 && (
              <div style={{
                textAlign: "center",
                animation: "fadeSlideIn 0.8s ease-out",
                maxWidth: "680px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                gap: "24px"
              }}>
                <button
                  onClick={() => setCurrentVdo((prev) => (prev - 1 + videos.length) % videos.length)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                    flexShrink: 0
                  }}
                  className="mode-toggle"
                  title="Previous Concept"
                >
                  <ChevronLeft size={24} />
                </button>

                <div style={{ flex: 1, pointerEvents: "none", userSelect: "none" }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                    background: "#000",
                    lineHeight: 0
                  }}>
                    <video
                      key={currentVdo}
                      src={videos[currentVdo].src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        maxHeight: "55vh",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                  <div style={{
                    marginTop: 20,
                    textAlign: "left",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                      Prompt: {videos[currentVdo].prompt}
                    </span>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer" }}>+</div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentVdo((prev) => (prev + 1) % videos.length)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                    flexShrink: 0
                  }}
                  className="mode-toggle"
                  title="Next Concept"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Messages */}
            {mode !== "blank" && messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {mode !== "blank" && loading && (
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 28, animation: "fadeSlideIn 0.3s ease-out" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
                  background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: 16, color: "#0ea5e9", fontSize: 20,
                }}>✦</div>
                <div style={{ padding: "10px 0" }}><TypingDots /></div>
              </div>
            )}
            {mode === "blank" && (
              <div style={{ animation: "fadeSlideIn 0.6s ease-out", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {!selectedAvatar ? (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "24px",
                  }}>
                    <div className="suggestion" style={{
                      background: "#ffffff",
                      padding: "32px 24px",
                      borderRadius: "24px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      textAlign: "center",
                      cursor: "pointer",
                    }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: "18px", background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white",
                        boxShadow: "0 10px 20px rgba(14, 165, 233, 0.2)"
                      }}>
                        <Sparkles size={28} />
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>Create an AI Avatar</h3>
                      <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>Generate a unique AI persona for your engine.</p>
                    </div>

                    <div className="suggestion" onClick={() => fileInputRef.current?.click()} style={{
                      background: "#ffffff",
                      padding: "32px 24px",
                      borderRadius: "24px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      textAlign: "center",
                      cursor: "pointer",
                    }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: "18px", background: "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#64748b",
                        border: "1px solid rgba(0,0,0,0.05)"
                      }}>
                        <Upload size={28} />
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>Upload your own</h3>
                      <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>Use your existing photo or brand assets.</p>
                    </div>

                    <div className="suggestion" onClick={() => setSelectedAvatar(avatarPlaceholder)} style={{
                      background: "#ffffff",
                      padding: "32px 24px",
                      borderRadius: "24px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      textAlign: "center",
                      cursor: "pointer",
                    }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: "18px", overflow: "hidden",
                        margin: "0 auto 20px", border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                      }}>
                        <img src={avatarPlaceholder} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar Preview" />
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>Select Tom</h3>
                      <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>Choose from our professionally curated models.</p>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "#ffffff",
                    padding: "48px",
                    borderRadius: "32px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    maxWidth: "500px",
                    margin: "0 auto",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 32px" }}>
                      <img
                        src={selectedAvatar}
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid white", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                        alt="Avatar Preview"
                      />
                      <button
                        onClick={() => setSelectedAvatar(null)}
                        style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#1e293b" }}>Photo Selected</h3>
                    <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "32px" }}>Ready to transform this photo into your content avatar?</p>
                    <button style={{
                      padding: "16px 40px",
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      borderRadius: "14px",
                      border: "none",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      margin: "0 auto",
                      boxShadow: "0 10px 20px rgba(14, 165, 233, 0.2)"
                    }}>
                      <Sparkles size={20} /> Generate Avatar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hidden attachment input for chat uploads */}
            <input
              type="file"
              ref={attachmentInputRef}
              style={{ display: "none" }}
              accept="image/*,video/*,application/pdf"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                files.forEach((file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "pdf";
                    setMessages(prev => [...prev, { role: "user", content: { type, src: result, name: file.name } }]);
                  };
                  reader.readAsDataURL(file);
                });
                // clear value so same file can be reselected
                if (attachmentInputRef.current) attachmentInputRef.current.value = "";
              }}
            />
            <div ref={bottomRef} />
          </div>
        </main>

        <div style={{
          padding: "16px 40px 48px", background: "transparent",
        }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <div className="input-wrap" style={{
              background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "24px", display: "flex", alignItems: "center",
              padding: "16px 16px 16px 24px", gap: 16, transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", gap: "12px", color: "#64748b" }}>
                <button onClick={() => attachmentInputRef.current?.click()} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} title="Upload media">
                  <Plus size={18} />
                </button>
                <button style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} title="Paste news link">
                  <LinkIcon size={20} />
                </button>
                <button style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} title="Voice input">
                  <Mic size={20} />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="Drop a topic. Get a viral script."
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", resize: "none",
                  color: "#334155", fontSize: 16, lineHeight: 1.6, padding: 0,
                  fontFamily: "inherit", caretColor: "#0ea5e9", maxHeight: 160,
                  outline: "none",
                }}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 48, height: 48, borderRadius: "14px", border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  background: input.trim() && !loading ? "#0ea5e9" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, transition: "all 0.3s ease", flexShrink: 0,
                  color: input.trim() && !loading ? "white" : "#475569",
                  boxShadow: input.trim() && !loading ? "0 8px 16px rgba(14, 165, 233, 0.3)" : "none",
                }}
              >
                <Send size={20} />
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", marginTop: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Pulse AI Media Engine · Press Enter to generate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
