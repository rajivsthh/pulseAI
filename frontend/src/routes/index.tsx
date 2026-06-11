import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bell, Mic, Link as LinkIcon, Sparkles, Send, History, Video, Zap, Search, Menu, X, ChevronRight, Plus, User, Upload, Play, Pause } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import hiVdo from "@/assets/hi.mp4";
import test2Audio from "@/assets/test2.mp3";
import avatarPlaceholder from "@/assets/image.png";

export const Route = createFileRoute("/")({
  component: Index,
});

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

function chunkSubtitle(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const pattern = [3, 2];
  const chunks: string[] = [];
  let index = 0;
  let patternIndex = 0;

  while (index < words.length) {
    const size = pattern[patternIndex % pattern.length];
    chunks.push(words.slice(index, index + size).join(" "));
    index += size;
    patternIndex += 1;
  }

  return chunks;
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
  const [videoDirection, setVideoDirection] = useState<"next">("next");
  const [hasPrompt, setHasPrompt] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoCountdown, setVideoCountdown] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [subtitleChunkIndex, setSubtitleChunkIndex] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDelayTimeoutRef = useRef<number | null>(null);
  const videoDelayIntervalRef = useRef<number | null>(null);

  const videos = [
    {
      src: hiVdo,
      prompt: "Next-gen AI verification workflow for viral content creation...",
      subtitle: "Microsoft has released its June security updates, addressing around 200 vulnerabilities across Windows and related products. Among the fixes are dozens of critical flaws and multiple publicly disclosed zero-day vulnerabilities. Security experts recommend updating systems as soon as possible, especially for organizations managing large numbers of Windows devices. The message is simple: if your systems aren't patched, you're giving attackers an opportunity.",
    },
    {
      src: hiVdo,
      prompt: "A cinematic short-form concept generated from latest tech news...",
      subtitle: "Microsoft has released its June security updates, addressing around 200 vulnerabilities across Windows and related products. Among the fixes are dozens of critical flaws and multiple publicly disclosed zero-day vulnerabilities. Security experts recommend updating systems as soon as possible, especially for organizations managing large numbers of Windows devices. The message is simple: if your systems aren't patched, you're giving attackers an opportunity.",
    }
  ];
  const subtitleChunks = chunkSubtitle(videos[currentVdo].subtitle);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.75;
  }, []);

  useEffect(() => {
    if (!audioRef.current || !videoRef.current || !isAudioPlaying) return;
    audioRef.current.currentTime = 0;
    videoRef.current.currentTime = 0;
    setSubtitleChunkIndex(0);
    Promise.all([
      audioRef.current.play(),
      videoRef.current.play(),
    ]).catch(() => setIsAudioPlaying(false));
  }, [currentVdo]);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    if (isAudioPlaying) {
      Promise.all([
        audio.play(),
        video.play(),
      ]).catch(() => setIsAudioPlaying(false));
    } else {
      audio.pause();
      video.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (!hasPrompt) return;
    setSubtitleChunkIndex(0);

    if (!isAudioPlaying || subtitleChunks.length <= 1) return;

    const interval = window.setInterval(() => {
      setSubtitleChunkIndex((prev) => (prev + 1) % subtitleChunks.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [hasPrompt, isAudioPlaying, currentVdo]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
  };

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setHasPrompt(true);
    setShowSuggestions(false);
    // hide video and start delay before showing it
    setVideoVisible(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const reply = `Here is a short video concept for: "${userText}". I would turn this into a fast hook, a clear middle, and a strong ending for a 15 to 30 second clip.`;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      // start a 12 second delay (configurable) before showing the video
      const delayMs = 12000; // 12 seconds (user suggested 10-15s)
      // clear any existing timers
      if (videoDelayTimeoutRef.current) window.clearTimeout(videoDelayTimeoutRef.current);
      if (videoDelayIntervalRef.current) window.clearInterval(videoDelayIntervalRef.current);
      setVideoCountdown(Math.ceil(delayMs / 1000));
      videoDelayIntervalRef.current = window.setInterval(() => {
        setVideoCountdown((prev) => {
          if (prev <= 1) {
            if (videoDelayIntervalRef.current) {
              window.clearInterval(videoDelayIntervalRef.current);
              videoDelayIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      videoDelayTimeoutRef.current = window.setTimeout(() => {
        setVideoVisible(true);
        setIsAudioPlaying(true);
        if (videoDelayTimeoutRef.current) { window.clearTimeout(videoDelayTimeoutRef.current); videoDelayTimeoutRef.current = null; }
      }, delayMs) as unknown as number;
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
      <audio ref={audioRef} src={test2Audio} loop preload="auto" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideFromRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideFromLeft { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
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

            {mode !== "blank" && hasPrompt && (
              videoVisible ? (
                <div style={{
                  animation: "fadeSlideIn 0.8s ease-out",
                  maxWidth: "680px",
                  margin: "0 auto",
                  userSelect: "none",
                  position: "relative"
                }}>
                  <div style={{
                    position: "relative",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                    background: "#000",
                    lineHeight: 0,
                    animation: videoDirection === "next" ? "slideFromRight 0.35s ease" : "slideFromLeft 0.35s ease"
                  }}>
                    <video
                      ref={videoRef}
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
                    <div style={{
                      position: "absolute",
                      left: 14,
                      right: 14,
                      bottom: 16,
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.78))",
                      color: "white",
                      textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 15, lineHeight: 1.55, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {subtitleChunks[subtitleChunkIndex]}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAudioPlaying((prev) => !prev)}
                      style={{
                        position: "absolute",
                        left: 16,
                        bottom: 16,
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(15, 23, 42, 0.82)",
                        color: "white",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.22)",
                      }}
                      aria-label={isAudioPlaying ? "Pause audio" : "Play audio"}
                      title={isAudioPlaying ? "Pause audio" : "Play audio"}
                    >
                      {isAudioPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                    </button>
                    <button
                      onClick={() => {
                        setVideoDirection("next");
                        setCurrentVdo((prev) => (prev + 1) % videos.length);
                        setIsAudioPlaying(true);
                      }}
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(15, 23, 42, 0.88)",
                        color: "white",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.22)",
                      }}
                      aria-label="Next video"
                      title="Next video"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  animation: "fadeSlideIn 0.8s ease-out",
                  maxWidth: "680px",
                  margin: "0 auto",
                  userSelect: "none",
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                  background: "#000",
                  minHeight: "220px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexDirection: "column",
                  gap: 12,
                  padding: 24
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Preparing video...</div>
                  <div style={{ fontSize: 13, color: "#cbd5e1" }}>This will appear in {videoCountdown} second{videoCountdown === 1 ? "" : "s"}.</div>
                  <div style={{ marginTop: 8 }}><TypingDots /></div>
                </div>
              )
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
