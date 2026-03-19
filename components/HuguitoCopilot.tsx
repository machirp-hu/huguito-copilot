"use client";

import { useState, useRef, useEffect } from "react";

const GLOBAL_CSS = `
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes springIn { from{opacity:0;transform:scale(0.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fabPulse { 0%,100%{box-shadow:0 0 0 0px rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
  @keyframes bounce3 { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  @keyframes chipIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
`;

const QUICK_CHIPS = [
  "¿Cómo modifico fechas de vacaciones?",
  "¿Cómo configuro el Nine Box?",
  "¿Por qué no aparece un usuario como jefe?",
  "¿Cómo habilito permisos de incidencias?",
  "¿Cómo segmento una notificación?",
];

const ARTICLES: Record<string, { title: string; module: string; steps: string[] }> = {
  "Configurar encuesta de clima": { title:"Cómo configurar una encuesta de clima", module:"Comunicaciones", steps:["Ingresá a Admin > Comunicaciones > Encuestas.","Hacé clic en 'Nueva encuesta' y elegí el tipo 'Clima organizacional'.","Configurá las preguntas, la frecuencia y la segmentación de destinatarios.","Activá la encuesta y revisá los resultados en el panel de reportes."] },
  "Gestión de permisos": { title:"Cómo gestionar permisos y roles", module:"Usuarios y roles", steps:["Ingresá a Admin > Usuarios > Roles.","Seleccioná el rol que querés editar o creá uno nuevo.","Activá o desactivá los permisos por módulo según corresponda.","Guardá los cambios — se aplican de forma inmediata."] },
  "Evaluaciones de desempeño": { title:"Cómo crear un ciclo de evaluación", module:"Desempeño", steps:["Ingresá a Admin > Desempeño > Ciclos.","Hacé clic en 'Nuevo ciclo' y definí el período de evaluación.","Configurá los evaluadores, el formulario y los plazos.","Lanzá el ciclo — los colaboradores recibirán una notificación automática."] },
  "Integración con Slack": { title:"Cómo integrar Humand con Slack", module:"Configuración", steps:["Ingresá a Admin > Configuración > Integraciones.","Seleccioná Slack y hacé clic en 'Conectar'.","Autorizá la conexión desde tu workspace de Slack.","Configurá qué notificaciones se envían al canal de tu elección."] },
  "OKRs y metas": { title:"Cómo configurar OKRs y metas", module:"Desempeño", steps:["Ingresá a Admin > Desempeño > Objetivos.","Creá un nuevo objetivo y definí los resultados clave (KRs).","Asignalo a un colaborador, equipo o área.","Hacé seguimiento del progreso desde el dashboard de objetivos."] },
};

const brand = "linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)";
const cardStyle: React.CSSProperties = { background:"#fff", border:"1px solid #f1f5f9", borderRadius:16 };

function HuguitoAvatar({ size = 36, bStyle = {} }: { size?: number; bStyle?: React.CSSProperties }) {
  const merged: React.CSSProperties = { width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0, ...bStyle };
  return (
    <div style={merged}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="52" r="44" fill="#1e2e8a"/>
        <circle cx="93" cy="52" r="4" fill="#2a3fa0"/>
        <circle cx="7"  cy="52" r="4" fill="#2a3fa0"/>
        <circle cx="50" cy="8"  r="4" fill="#2a3fa0"/>
        <circle cx="50" cy="96" r="4" fill="#2a3fa0"/>
        <circle cx="79" cy="21" r="4" fill="#2a3fa0"/>
        <circle cx="21" cy="21" r="4" fill="#2a3fa0"/>
        <circle cx="79" cy="83" r="4" fill="#2a3fa0"/>
        <circle cx="21" cy="83" r="4" fill="#2a3fa0"/>
        <ellipse cx="35" cy="42" rx="12" ry="13" fill="white"/>
        <ellipse cx="65" cy="42" rx="12" ry="13" fill="white"/>
        <circle cx="37" cy="44" r="7" fill="#1a1a6e"/>
        <circle cx="67" cy="44" r="7" fill="#1a1a6e"/>
        <circle cx="33" cy="40" r="3" fill="white"/>
        <circle cx="63" cy="40" r="3" fill="white"/>
        <path d="M38 62 Q50 72 62 62" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function SimpleMarkdown({ text = "" }: { text?: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize:13, lineHeight:1.6, color:"#1e293b" }}>
      {lines.map(function(line, i) {
        if (!line.trim()) return <div key={i} style={{ height:6 }} />;
        if (line.startsWith('http')) {
          return (
            <a key={i} href={line.trim()} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-block", marginTop:6, padding:"7px 12px", borderRadius:8, background:"#eff6ff", color:"#2563eb", fontWeight:600, fontSize:12, textDecoration:"none", border:"1px solid #bfdbfe" }}>
              💬 Contactar a soporte →
            </a>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map(function(p, j) {
          return p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p;
        });
        if (/^\d+\.\s/.test(line)) return <div key={i} style={{ paddingLeft:12, marginBottom:2 }}>• {rendered}</div>;
        if (/^-\s/.test(line))     return <div key={i} style={{ paddingLeft:12, marginBottom:2, color:"#475569" }}>· {rendered}</div>;
        return <div key={i} style={{ marginBottom:2 }}>{rendered}</div>;
      })}
    </div>
  );
}

function HumandLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:32, height:32, borderRadius:10, background:brand, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(79,70,229,0.3)" }}>
        <span style={{ color:"#fff", fontWeight:900, fontSize:13 }}>H</span>
      </div>
      <span style={{ fontWeight:700, color:"#0f172a", fontSize:17 }}>humand</span>
      <span style={{ fontSize:11, background:"#eff6ff", color:"#2563eb", padding:"2px 8px", borderRadius:999, fontWeight:600 }}>Help Center</span>
    </div>
  );
}

function Header({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <header style={{ position:"sticky", top:0, zIndex:40, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(12px)", borderBottom:"1px solid #f1f5f9", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <HumandLogo />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={onOpenChat} style={{ fontSize:13, color:"#64748b", padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", background:"transparent" }}>✨ Huguito</button>
          <div style={{ width:32, height:32, borderRadius:999, background:brand, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>A</div>
        </div>
      </div>
    </header>
  );
}

function ArticleModal({ article, onClose, onOpenChat }: { article: { title: string; module: string; steps: string[] }; onClose: () => void; onOpenChat: () => void }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(2px)" }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{ background:"#fff", borderRadius:20, padding:28, maxWidth:480, width:"90%", boxShadow:"0 24px 60px rgba(0,0,0,0.15)", animation:"springIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <span style={{ fontSize:11, background:"#eff6ff", color:"#2563eb", padding:"2px 8px", borderRadius:999, fontWeight:600 }}>{article.module}</span>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:"8px 0 0" }}>{article.title}</h2>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:999, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:12 }}>✕</button>
        </div>
        <ol style={{ paddingLeft:20, margin:"0 0 20px" }}>
          {article.steps.map(function(step, i) {
            return <li key={i} style={{ fontSize:13, color:"#334155", lineHeight:1.7, marginBottom:6 }}>{step}</li>;
          })}
        </ol>
        <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:"#64748b" }}>¿No encontraste lo que buscabas?</span>
          <button onClick={function(){ onClose(); onOpenChat(); }} style={{ fontSize:12, fontWeight:600, color:"#2563eb", border:"none", background:"none", cursor:"pointer" }}>
            Pregúntale a Huguito →
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [activeArticle, setArticle] = useState<{ title: string; module: string; steps: string[] } | null>(null);

  function handleSelect(q: string) {
    setFocused(false);
    setQuery(q);
    if (ARTICLES[q]) setArticle(ARTICLES[q]);
    else onOpenChat();
  }

  return (
    <>
      {activeArticle && <ArticleModal article={activeArticle} onClose={function(){ setArticle(null); }} onOpenChat={onOpenChat} />}
      {focused && <div onClick={function(){ setFocused(false); }} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.18)", zIndex:30, backdropFilter:"blur(1px)" }} />}
      <section style={{ position:"relative", background:"linear-gradient(180deg,#fff 0%,#f8fafc 100%)", borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:-80, left:"20%", width:320, height:320, background:"rgba(219,234,254,0.5)", borderRadius:"50%", filter:"blur(60px)" }} />
          <div style={{ position:"absolute", top:-60, right:"20%", width:260, height:260, background:"rgba(224,231,255,0.4)", borderRadius:"50%", filter:"blur(60px)" }} />
        </div>
        <div style={{ position:"relative", maxWidth:720, margin:"0 auto", padding:"64px 24px", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#eff6ff", border:"1px solid #bfdbfe", color:"#2563eb", fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:999, marginBottom:20 }}>
            ✨ Huguito Copilot disponible — Huckathon 2026
          </div>
          <h1 style={{ fontSize:44, fontWeight:800, color:"#0f172a", lineHeight:1.15, margin:"0 0 14px", letterSpacing:"-1px" }}>
            ¿En qué podemos{" "}
            <span style={{ background:"linear-gradient(135deg,#2563eb,#4f46e5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>ayudarte?</span>
          </h1>
          <p style={{ color:"#64748b", fontSize:17, marginBottom:32, lineHeight:1.6 }}>
            Explora guías, tutoriales y documentación. O pregúntale directamente a Huguito.
          </p>
          <div style={{ position:"relative", zIndex:40 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", borderRadius:18, padding:"14px 20px", boxShadow:focused?"0 8px 40px rgba(37,99,235,0.15)":"0 4px 20px rgba(0,0,0,0.08)", border:focused?"2px solid #60a5fa":"2px solid transparent", transition:"all .2s" }}>
              <span style={{ fontSize:16, color:focused?"#2563eb":"#94a3b8" }}>🔍</span>
              <input value={query} onChange={function(e){ setQuery(e.target.value); }} onFocus={function(){ setFocused(true); }}
                onKeyDown={function(e){ if(e.key==="Enter" && query.trim()) handleSelect(query); }}
                placeholder="Buscar artículos, guías y más..."
                style={{ flex:1, border:"none", outline:"none", fontSize:15, color:"#1e293b", background:"transparent" }} />
            </div>
            {focused && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:8, background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.12)", border:"1px solid #f1f5f9", overflow:"hidden", animation:"fadeSlideIn .15s ease forwards" }}>
                <div style={{ padding:"8px 16px 6px", borderBottom:"1px solid #f8fafc" }}>
                  <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", margin:0 }}>Búsquedas populares</p>
                </div>
                {Object.keys(ARTICLES).map(function(s) {
                  return (
                    <button key={s} onClick={function(){ handleSelect(s); }}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
                      onMouseEnter={function(e){ (e.currentTarget as HTMLButtonElement).style.background="#eff6ff"; }}
                      onMouseLeave={function(e){ (e.currentTarget as HTMLButtonElement).style.background="transparent"; }}>
                      <span style={{ color:"#94a3b8", fontSize:13 }}>🔍</span>
                      <span style={{ fontSize:13, color:"#334155", flex:1 }}>{s}</span>
                      <span style={{ color:"#cbd5e1", fontSize:12 }}>→</span>
                    </button>
                  );
                })}
                <div style={{ padding:"10px 16px", borderTop:"1px solid #f8fafc", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13 }}>✨</span>
                  <span style={{ fontSize:12, color:"#64748b" }}>
                    ¿No encontrás lo que buscás?{" "}
                    <button onClick={function(){ onOpenChat(); setFocused(false); }} style={{ color:"#2563eb", fontWeight:600, border:"none", background:"none", cursor:"pointer", fontSize:12, padding:0 }}>
                      Pregúntale a Huguito →
                    </button>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function MetricsBar() {
  const metrics = [
    { emoji:"💬", value:"12.4K", label:"Consultas iniciadas este mes",  color:"#2563eb", bg:"#eff6ff" },
    { emoji:"📊", value:"89.3K", label:"Consultas totales con Huguito", color:"#7c3aed", bg:"#f5f3ff" },
    { emoji:"🏢", value:"340+",  label:"Empresas usando Huguito",       color:"#059669", bg:"#f0fdf4" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:40 }}>
      {metrics.map(function(m) {
        return (
          <div key={m.label} style={{ ...cardStyle, padding:"20px 22px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, background:m.bg, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{m.emoji}</div>
            <div>
              <p style={{ fontSize:24, fontWeight:800, color:m.color, margin:"0 0 2px" }}>{m.value}</p>
              <p style={{ fontSize:12, color:"#64748b", margin:0, lineHeight:1.4 }}>{m.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CATEGORIES = [
  { emoji:"👥", bg:"linear-gradient(135deg,#3b82f6,#2563eb)", title:"Ayuda para Administradores", desc:"Configuración de módulos, roles e integraciones.", count:48 },
  { emoji:"📊", bg:"linear-gradient(135deg,#6366f1,#7c3aed)", title:"Desempeño",                  desc:"Ciclos de evaluación 360°, OKRs y reportes.", count:32 },
  { emoji:"💬", bg:"linear-gradient(135deg,#10b981,#0d9488)", title:"Comunicaciones",             desc:"Encuestas de clima, noticias y reconocimientos.", count:27 },
  { emoji:"🔐", bg:"linear-gradient(135deg,#f43f5e,#e11d48)", title:"Seguridad & Permisos",       desc:"Roles de acceso, SSO y auditoría de logs.", count:19 },
  { emoji:"⚙️", bg:"linear-gradient(135deg,#f59e0b,#f97316)", title:"Configuración",              desc:"Personalización de la plataforma e integraciones.", count:41 },
  { emoji:"🔔", bg:"linear-gradient(135deg,#06b6d4,#0284c7)", title:"Notificaciones",             desc:"Push, email, Slack y alertas automáticas.", count:15 },
];

function CategoryCard({ emoji, bg, title, desc, count, onClick }: { emoji: string; bg: string; title: string; desc: string; count: number; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={function(){ setHover(true); }} onMouseLeave={function(){ setHover(false); }}
      style={{ ...cardStyle, padding:22, textAlign:"left", cursor:"pointer", transition:"all .25s", transform:hover?"translateY(-3px)":"none", boxShadow:hover?"0 12px 40px rgba(0,0,0,0.1)":"none", width:"100%", display:"block" }}>
      <div style={{ width:48, height:48, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14, transition:"transform .2s", transform:hover?"scale(1.08)":"scale(1)" }}>{emoji}</div>
      <h3 style={{ fontWeight:600, color:hover?"#2563eb":"#0f172a", fontSize:14, margin:"0 0 6px" }}>{title}</h3>
      <p style={{ color:"#64748b", fontSize:13, lineHeight:1.5, margin:"0 0 12px" }}>{desc}</p>
      <div style={{ display:"flex", alignItems:"center", fontSize:12, color:"#94a3b8", fontWeight:500 }}>
        📄 {count} artículos
        <span style={{ marginLeft:"auto", opacity:hover?1:0, color:"#2563eb" }}>→</span>
      </div>
    </button>
  );
}

function CategoryGrid({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div style={{ marginBottom:40 }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>Explorar por categoría</h2>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Encuentra respuestas rápidas por módulo</p>
        </div>
        <button style={{ fontSize:13, color:"#2563eb", fontWeight:600, border:"none", background:"none", cursor:"pointer" }}>Ver todas →</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {CATEGORIES.map(function(c) { return <CategoryCard key={c.title} {...c} onClick={onOpenChat} />; })}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, padding:"10px 14px", background:"#f1f5f9", borderRadius:"14px 14px 14px 4px" }}>
      {[0,1,2].map(function(i) {
        return <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#94a3b8", display:"block", animation:"bounce3 1.2s " + (i*0.2) + "s infinite" }} />;
      })}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", animation:"fadeSlideIn 0.15s ease forwards" }}>
      <div style={{ background:brand, color:"#fff", borderRadius:"14px 14px 4px 14px", padding:"9px 13px", maxWidth:"78%", fontSize:13, lineHeight:1.5 }}>
        {text}
      </div>
    </div>
  );
}

function BotBubble({ text, showFeedback, msgId, onFeedback, isZendesk }: { text: string; showFeedback: boolean; msgId: number; onFeedback?: (id: number, val: string) => void; isZendesk?: boolean }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  function handleFeedback(val: string) {
    setFeedback(val);
    if (onFeedback) onFeedback(msgId, val);
  }
  return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-start", animation:"fadeSlideIn 0.2s ease forwards" }}>
      <HuguitoAvatar size={28} bStyle={{ border:"2px solid #c5cae9" }} />
      <div style={{ maxWidth:"82%" }}>
        <div style={{ background:"#e8eaf6", borderRadius:"14px 14px 14px 4px", padding:"10px 13px" }}>
          <SimpleMarkdown text={text} />
        </div>
        {showFeedback && !isZendesk && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
            {feedback === null ? (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>¿Fue útil?</span>
                <button onClick={function(){ handleFeedback("up"); }} style={{ width:26, height:26, borderRadius:999, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>👍</button>
                <button onClick={function(){ handleFeedback("down"); }} style={{ width:26, height:26, borderRadius:999, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>👎</button>
              </div>
            ) : feedback === "up" ? (
              <span style={{ fontSize:11, color:"#059669" }}>👍 ¡Gracias por tu feedback!</span>
            ) : (
              <span style={{ fontSize:11, color:"#dc2626" }}>👎 Gracias, vamos a mejorar.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type Message = { id: number; type: "user" | "bot"; text: string; showFeedback: boolean; isZendesk?: boolean; feedback?: string };
type HistoryItem = { role: "user" | "assistant"; content: string };

function HuguitoChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id:0, type:"bot", text:"¡Hola! Soy **Huguito Copilot** 🤖, tu asistente experto en Humand.\n\nPara comenzar, ¿cuál es tu usuario de Humand?", showFeedback:false }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const histRef = useRef<HistoryItem[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  function addMsg(msg: Omit<Message, "id">) {
    setMessages(function(prev) {
      return prev.concat([{ ...msg, id: Date.now() + Math.random() }]);
    });
  }

  function handleFeedback(msgId: number, val: string) {
    setMessages(function(prev) {
      return prev.map(function(m) {
        return m.id === msgId ? { ...m, feedback: val } : m;
      });
    });
  }

  async function send(text?: string) {
    const msg = String(text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setShowChips(false);
    addMsg({ type:"user", text:msg, showFeedback:false });

    if (!verified) {
      await new Promise(function(r){ setTimeout(r, 1000); });
      const lower = msg.trim().toLowerCase().replace(/\s+/g,"");
      let nombre: string | null = null;
      if (lower.indexOf("humand") >= 0) {
        const parte = lower.split(".")[0];
        if (parte && parte.length > 0) {
          nombre = parte[0].toUpperCase() + parte.slice(1);
        }
      }
      if (nombre) {
        setVerified(true);
        addMsg({ type:"bot", text:"¡Perfecto! Te encontré en el sistema. 🎉\n\n¡Hola, **" + nombre + "**! ¿En qué te puedo ayudar hoy?", showFeedback:false });
        setShowChips(true);
      } else {
        addMsg({ type:"bot", text:"Hmm, no encuentro tu usuario en la base de datos de Humand. 🤔\n\n¿Podés verificar que lo escribiste bien? Ingresá tu usuario de Humand (muchas veces es tu correo, número de identidad o número de empleado).", showFeedback:false });
      }
      setLoading(false);
      return;
    }

    histRef.current.push({ role:"user", content:msg });
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ messages: histRef.current }),
      });
      if (!res.ok) throw new Error("API error " + res.status);
      const data = await res.json();
      const reply: string = data.reply;
      histRef.current.push({ role:"assistant", content:reply });
      if (reply.startsWith("ESCALAR_ZENDESK")) {
        addMsg({ type:"bot", text:reply.replace("ESCALAR_ZENDESK","").trim(), showFeedback:false, isZendesk:true });
      } else {
        addMsg({ type:"bot", text:reply, showFeedback:true });
      }
    } catch {
      addMsg({ type:"bot", text:"No pude conectarme en este momento. Intentá de nuevo en unos segundos.", showFeedback:false });
    }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", bottom:84, right:20, width:380, maxHeight:600, display:"flex", flexDirection:"column", borderRadius:24, boxShadow:"0 24px 80px rgba(0,0,0,0.18)", zIndex:50, overflow:"hidden", background:"rgba(255,255,255,0.98)", border:"1px solid rgba(99,102,241,0.12)", animation:"springIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
      <div style={{ background:brand, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <HuguitoAvatar size={40} bStyle={{ border:"2.5px solid rgba(255,255,255,0.5)" }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Huguito Copilot</span>
            <span style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(74,222,128,0.25)", color:"#86efac", fontSize:10, padding:"2px 7px", borderRadius:999, fontWeight:600 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"bounce3 2s infinite" }} /> Live
            </span>
          </div>
          <p style={{ color:"rgba(191,219,254,0.9)", fontSize:11, margin:0 }}>Powered by Humand AI · RAG Engine</p>
        </div>
        <button onClick={onClose} style={{ width:28, height:28, borderRadius:999, background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", color:"#fff", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:12, minHeight:0, maxHeight:380 }}>
        {messages.map(function(m) {
          if (m.type === "user") return <UserBubble key={m.id} text={m.text} />;
          return (
            <BotBubble key={m.id} text={m.text} isZendesk={m.isZendesk} msgId={m.id} onFeedback={handleFeedback} showFeedback={m.showFeedback} />
          );
        })}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <HuguitoAvatar size={28} bStyle={{ border:"2px solid #c5cae9" }} />
            <TypingDots />
          </div>
        )}
        {showChips && !loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:6, paddingTop:4 }}>
            <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, margin:0 }}>PREGUNTAS FRECUENTES</p>
            {QUICK_CHIPS.map(function(c, i) {
              return (
                <button key={c} onClick={function(){ send(c); }}
                  style={{ textAlign:"left", padding:"8px 12px", borderRadius:10, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#334155", fontSize:12, cursor:"pointer", animation:"chipIn 0.2s " + (i*0.06) + "s ease forwards", opacity:0 }}
                  onMouseEnter={function(e){ (e.currentTarget as HTMLButtonElement).style.background="#eff6ff"; (e.currentTarget as HTMLButtonElement).style.borderColor="#bfdbfe"; (e.currentTarget as HTMLButtonElement).style.color="#2563eb"; }}
                  onMouseLeave={function(e){ (e.currentTarget as HTMLButtonElement).style.background="#f8fafc"; (e.currentTarget as HTMLButtonElement).style.borderColor="#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color="#334155"; }}>
                  {c}
                </button>
              );
            })}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding:"10px 12px", borderTop:"1px solid #f1f5f9", background:"rgba(255,255,255,0.9)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", borderRadius:14, padding:"8px 12px", border:"1px solid #e2e8f0" }}>
          <input value={input} onChange={function(e){ setInput(e.target.value); }}
            onKeyDown={function(e){ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); }}}
            placeholder={verified ? "Escribí tu pregunta..." : "Tu usuario de Humand..."}
            style={{ flex:1, border:"none", outline:"none", fontSize:13, color:"#1e293b", background:"transparent" }}
            disabled={loading} />
          <button onClick={function(){ send(); }} disabled={loading || !input.trim()}
            style={{ width:30, height:30, borderRadius:10, background:(!loading && input.trim())?brand:"#e2e8f0", border:"none", cursor:(!loading && input.trim())?"pointer":"default", color:"#fff", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            →
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:10, color:"#cbd5e1", marginTop:6, marginBottom:0 }}>Huguito puede cometer errores. Verifica información crítica.</p>
      </div>
    </div>
  );
}

function HuguitoFAB({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} title="Abrir Huguito Copilot"
      style={{ position:"fixed", bottom:20, right:20, zIndex:50, width:60, height:60, borderRadius:"50%", background:brand, border:"none", cursor:"pointer", padding:0, overflow:"hidden", boxShadow:"0 8px 30px rgba(79,70,229,0.4)", animation:"fabPulse 3s ease-in-out infinite" }}
      onMouseEnter={function(e){ (e.currentTarget as HTMLButtonElement).style.transform="scale(1.1)"; }}
      onMouseLeave={function(e){ (e.currentTarget as HTMLButtonElement).style.transform="scale(1)"; }}>
      <HuguitoAvatar size={60} />
      <span style={{ position:"absolute", top:0, right:0, width:16, height:16, background:"#4ade80", borderRadius:"50%", border:"2px solid #fff" }} />
    </button>
  );
}

export default function HuguitoCopilot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  function openChat()  { setChatOpen(true); }
  function closeChat() { setChatOpen(false); setChatKey(function(k){ return k + 1; }); }

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      <Header onOpenChat={openChat} />
      <Hero onOpenChat={openChat} />
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"48px 24px" }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>Insights de Huguito</h2>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Métricas de uso y actividad del asistente</p>
        </div>
        <MetricsBar />
        <CategoryGrid onOpenChat={openChat} />
      </main>
      <footer style={{ borderTop:"1px solid #f1f5f9", background:"#fff", marginTop:24 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <HumandLogo />
          <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>© 2026 Humand · Huckathon Edition · Powered by Huguito Copilot</p>
          <div style={{ display:"flex", gap:16 }}>
            {["Privacidad","Términos","Status"].map(function(l) {
              return <button key={l} style={{ fontSize:12, color:"#94a3b8", border:"none", background:"none", cursor:"pointer" }}>{l}</button>;
            })}
          </div>
        </div>
      </footer>
      {!chatOpen && <HuguitoFAB onClick={openChat} />}
      {chatOpen  && <HuguitoChat key={chatKey} onClose={closeChat} />}
    </div>
  );
}
