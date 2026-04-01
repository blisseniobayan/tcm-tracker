import { useState } from "react";

/* ─── Brand tokens ─────────────────────────────────────────────── */
const BRAND = {
  red:   "#C10020",
  pink:  "#FF1477",
  navy:  "#0D1B2A",
  cream: "#FFF8F0",
  white: "#FFFFFF",
};

/* ─── Config ────────────────────────────────────────────────────── */
const ADMIN_PASSWORD = "TCMGlobal2620!";

const SCRIPT_URL =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SCRIPT_URL || ""
    : "";

const WEEKS = [
  "Week 1","Week 2","Week 3","Week 4","Week 5","Week 6",
  "Week 7","Week 8","Week 9","Week 10","Week 11","Week 12",
];

/* ─── Global CSS ─────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::placeholder{color:#bbb}
  input:focus,textarea:focus,select:focus{outline:none}
  .btn{transition:all .18s ease;cursor:pointer}
  .btn:hover{opacity:.88;transform:translateY(-1px)}
  .btn:active{transform:translateY(0)}
  .card{transition:transform .18s ease}
  .card:hover{transform:translateY(-2px)}
  .dot{transition:all .15s ease;cursor:pointer}
  .dot:hover{transform:scale(1.12)}
`;

/* ─── Reusable primitives ─────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label style={{
    display: "block",
    fontFamily: "'Poppins',sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: BRAND.navy,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: 7,
  }}>
    {children}
    {required && <span style={{ color: BRAND.red }}> *</span>}
  </label>
);

const Err = ({ msg }) =>
  msg ? <p style={{ color: BRAND.red, fontSize: 13, marginTop: 5 }}>{msg}</p> : null;

const Input = ({ value, onChange, placeholder, multiline, rows = 3, type = "text" }) => {
  const s = {
    width: "100%",
    padding: "12px 15px",
    border: "1.5px solid #e2e2e2",
    borderRadius: 10,
    fontFamily: "'Poppins',sans-serif",
    fontSize: 15,
    color: BRAND.navy,
    background: BRAND.white,
    resize: "vertical",
  };
  const h = {
    onFocus: e => (e.target.style.borderColor = BRAND.red),
    onBlur:  e => (e.target.style.borderColor = "#e2e2e2"),
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} {...h} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...s, resize: "none" }} {...h} />;
};

const Rating = ({ value, onChange }) => {
  const labels = ["","Just started","Made some effort","Solid week","Showed up well","Absolutely locked in"];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} className="dot" onClick={() => onChange(n)} style={{
            width: 50, height: 50, borderRadius: "50%",
            border: `2px solid ${value === n ? BRAND.red : "#ddd"}`,
            background: value === n ? BRAND.red : BRAND.white,
            color: value === n ? BRAND.white : BRAND.navy,
            fontFamily: "'Poppins',sans-serif",
            fontSize: 17, fontWeight: 600,
          }}>{n}</button>
        ))}
      </div>
      {value > 0 && (
        <p style={{ textAlign: "center", fontSize: 13, color: BRAND.red, fontStyle: "italic" }}>
          {labels[value]}
        </p>
      )}
    </div>
  );
};

/* ─── Data helpers ───────────────────────────────────────────────── */
async function persistEntry(entry) {
  if (SCRIPT_URL) {
    await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(entry) });
  } else if (typeof window.storage !== "undefined") {
    let all = [];
    try { const r = await window.storage.get("tcm_checkins"); if (r) all = JSON.parse(r.value); } catch (_) {}
    all.push(entry);
    await window.storage.set("tcm_checkins", JSON.stringify(all));
  }
}

async function fetchEntries(password) {
  if (SCRIPT_URL) {
    const resp = await fetch(`${SCRIPT_URL}?action=getAll&pw=${encodeURIComponent(password)}`);
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } else if (typeof window.storage !== "undefined") {
    try { const r = await window.storage.get("tcm_checkins"); return r ? JSON.parse(r.value) : []; } catch (_) { return []; }
  }
  return [];
}

/* ─── Member View ─────────────────────────────────────────────────── */
function MemberView({ onAdmin }) {
  const [step, setStep] = useState("form");
  const [sub, setSub]   = useState(false);
  const [err, setErr]   = useState({});
  const [f, setF]       = useState({ memberId: "", name: "", week: "Week 1", did: "", completed: "", goal: "", rating: 0 });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.name.trim())      e.name      = "Please enter your name.";
    if (!f.did.trim())       e.did       = "Please fill this in.";
    if (!f.completed.trim()) e.completed = "Please fill this in.";
    if (!f.goal.trim())      e.goal      = "Please fill this in.";
    if (!f.rating)           e.rating    = "Please pick a rating.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    setErr({});
    setSub(true);
    try {
      const entry = { ...f, timestamp: new Date().toISOString(), id: Date.now().toString() };
      await persistEntry(entry);
      setStep("done");
    } catch (_) {
      alert("Something went wrong. Please try again.");
    }
    setSub(false);
  };

  if (step === "done") return (
    <div style={{ minHeight: "100vh", background: BRAND.cream }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: BRAND.red, display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: 30, color: BRAND.white,
        }}>✓</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: BRAND.navy, marginBottom: 12 }}>
          Check-in submitted.
        </h2>
        <p style={{ color: "#666", fontSize: 15, lineHeight: 1.75, fontFamily: "'Poppins',sans-serif" }}>
          That's one more week of showing up, {f.name.split(" ")[0]}.<br />
          Keep building. See you next week. 🔴
        </p>
        <button className="btn" onClick={() => { setF({ memberId: "", name: "", week: "Week 1", did: "", completed: "", goal: "", rating: 0 }); setStep("form"); }}
          style={{
            marginTop: 32, padding: "13px 32px",
            background: "transparent", border: `2px solid ${BRAND.red}`,
            borderRadius: 10, color: BRAND.red,
            fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15,
          }}>
          Submit another check-in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, paddingBottom: 52 }}>
      <style>{css}</style>

      <div style={{ textAlign: "center", padding: "32px 24px 0" }}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>🔴</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: BRAND.navy, lineHeight: 1.2 }}>
          The Career Multiverse
        </h1>
        <p style={{ fontSize: 13, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>
          Weekly Check-In
        </p>
        <div style={{ width: 40, height: 3, background: `linear-gradient(90deg,${BRAND.red},${BRAND.pink})`, margin: "14px auto 0", borderRadius: 2 }} />
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px 0" }}>

        <div style={{ background: BRAND.navy, borderRadius: 14, padding: "16px 20px", marginBottom: 28 }}>
          <p style={{ color: BRAND.cream, fontFamily: "'Poppins',sans-serif", fontSize: 14, lineHeight: 1.65 }}>
            This is your private weekly check-in. Nobody in TCM sees your answers — only you submit it. Show up for yourself every week.
          </p>
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label>Member ID <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></Label>
          <Input value={f.memberId} onChange={v => set("memberId", v)} placeholder="e.g. TCM-001" />
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
            Don't have one yet? Leave this blank — it won't stop you submitting.
          </p>
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label required>Your Full Name</Label>
          <Input value={f.name} onChange={v => set("name", v)} placeholder="e.g. Chisom Adeyemi" />
          <Err msg={err.name} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label required>Which Week Is This?</Label>
          <select value={f.week} onChange={e => set("week", e.target.value)} style={{
            width: "100%", padding: "12px 15px",
            border: "1.5px solid #e2e2e2", borderRadius: 10,
            fontFamily: "'Poppins',sans-serif", fontSize: 15,
            color: BRAND.navy, background: BRAND.white, appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C10020' fill='none' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
          }}>
            {WEEKS.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label required>What did you work on this week?</Label>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>
            LinkedIn, career moves, content, applications — anything counts.
          </p>
          <Input multiline value={f.did} onChange={v => set("did", v)} placeholder="e.g. Updated my LinkedIn headline and posted for the first time" />
          <Err msg={err.did} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label required>What did you actually complete or publish?</Label>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>
            "Nothing" is a valid answer — and a useful one.
          </p>
          <Input multiline rows={2} value={f.completed} onChange={v => set("completed", v)} placeholder="e.g. Published 1 post, finished my About section" />
          <Err msg={err.completed} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <Label required>One goal for next week</Label>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>
            One specific, doable thing. Not a list.
          </p>
          <Input value={f.goal} onChange={v => set("goal", v)} placeholder="e.g. Connect with 5 people in my target industry" />
          <Err msg={err.goal} />
        </div>

        <div style={{ marginBottom: 34 }}>
          <Label required>How consistent were you this week?</Label>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>
            1 = barely showed up · 5 = absolutely locked in
          </p>
          <Rating value={f.rating} onChange={v => set("rating", v)} />
          <Err msg={err.rating} />
        </div>

        <button className="btn" onClick={submit} disabled={sub} style={{
          width: "100%", padding: "15px",
          background: sub ? "#aaa" : BRAND.red,
          border: "none", borderRadius: 12,
          color: BRAND.white,
          fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16,
        }}>
          {sub ? "Submitting…" : "Submit My Check-In 🔴"}
        </button>

        <p onClick={onAdmin} style={{
          textAlign: "center", marginTop: 28,
          fontSize: 13, color: "#000",
          cursor: "pointer", userSelect: "none",
          fontFamily: "'Poppins',sans-serif",
        }}>
          Admin
        </p>
      </div>
    </div>
  );
}

/* ─── Admin View ──────────────────────────────────────────────────── */
function AdminView({ onBack }) {
  const [authed,  setAuthed]  = useState(false);
  const [pw,      setPw]      = useState("");
  const [pwErr,   setPwErr]   = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fw,      setFw]      = useState("All");
  const [fn,      setFn]      = useState("");

  const login = async () => {
    if (pw === ADMIN_PASSWORD) {
      setLoading(true);
      try {
        const data = await fetchEntries(pw);
        setEntries(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (_) {}
      setAuthed(true);
      setLoading(false);
    } else {
      setPwErr(true);
    }
  };

  const filtered = entries.filter(e =>
    (fw === "All" || e.week === fw) &&
    (!fn || e.name.toLowerCase().includes(fn.toLowerCase()))
  );
  const unique = [...new Set(entries.map(e => e.name))].length;
  const avg    = entries.length
    ? (entries.reduce((s, e) => s + Number(e.rating), 0) / entries.length).toFixed(1)
    : "—";

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: BRAND.cream }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", padding: "36px 24px 0" }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: BRAND.navy }}>Admin Access</h1>
        <div style={{ width: 40, height: 3, background: BRAND.red, margin: "12px auto 0", borderRadius: 2 }} />
      </div>
      <div style={{ maxWidth: 380, margin: "36px auto", padding: "0 24px" }}>
        <div style={{ background: BRAND.white, borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(13,27,42,0.08)" }}>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 20, lineHeight: 1.6, fontFamily: "'Poppins',sans-serif" }}>
            This view is for Bliss only. Enter the admin password to see all member check-ins.
          </p>
          <Input value={pw} onChange={v => { setPw(v); setPwErr(false); }} placeholder="Admin password" type="password" />
          {pwErr && <p style={{ color: BRAND.red, fontSize: 13, marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>Incorrect password.</p>}
          <button className="btn" onClick={login} style={{
            width: "100%", marginTop: 16, padding: "14px",
            background: BRAND.navy, border: "none", borderRadius: 10,
            color: BRAND.white, fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15,
          }}>
            {loading ? "Loading…" : "Enter"}
          </button>
          <p onClick={onBack} style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: BRAND.red, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
            ← Back to check-in
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, paddingBottom: 52 }}>
      <style>{css}</style>

      <div style={{ background: BRAND.navy, padding: "20px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: BRAND.white, fontSize: 26, fontWeight: 700 }}>
              TCM Admin Dashboard
            </h2>
            <p style={{ color: "#aaa", fontSize: 13, marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>Member Accountability Overview</p>
          </div>
          <p onClick={onBack} style={{ color: "#aaa", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>← Exit</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 0" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Check-ins", value: entries.length },
            { label: "Unique Members",  value: unique },
            { label: "Avg. Rating",     value: avg },
          ].map(s => (
            <div key={s.label} style={{ background: BRAND.white, borderRadius: 12, padding: "16px 14px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: BRAND.red }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input type="text" placeholder="Search by name…" value={fn} onChange={e => setFn(e.target.value)} style={{
            flex: 1, minWidth: 160, padding: "10px 14px",
            border: "1.5px solid #e2e2e2", borderRadius: 8,
            fontFamily: "'Poppins',sans-serif", fontSize: 14,
            color: BRAND.navy, background: BRAND.white,
          }} />
          <select value={fw} onChange={e => setFw(e.target.value)} style={{
            padding: "10px 14px", border: "1.5px solid #e2e2e2",
            borderRadius: 8, fontFamily: "'Poppins',sans-serif",
            fontSize: 14, color: BRAND.navy, background: BRAND.white,
          }}>
            <option value="All">All Weeks</option>
            {WEEKS.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>
          Showing {filtered.length} check-in{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: 48, background: BRAND.white, borderRadius: 14 }}>
              <p style={{ color: "#bbb", fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>No check-ins yet.</p>
            </div>
          : filtered.map(e => (
            <div key={e.id} className="card" style={{
              background: BRAND.white, borderRadius: 14,
              padding: 20, marginBottom: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              borderLeft: `4px solid ${BRAND.red}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: BRAND.navy }}>{e.name}</h3>
                  <p style={{ fontSize: 12, color: "#aaa", marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>
                    {e.memberId ? <span style={{ color: BRAND.red, fontWeight: 600 }}>{e.memberId} · </span> : null}
                    {e.week} · {new Date(e.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{
                  background: BRAND.red, color: BRAND.white,
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 14, fontWeight: 700,
                  fontFamily: "'Poppins',sans-serif", flexShrink: 0,
                }}>
                  {e.rating}/5
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { label: "Worked on",      val: e.did },
                  { label: "Completed",      val: e.completed },
                  { label: "Goal next week", val: e.goal },
                ].map(f => (
                  <div key={f.label}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.red, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Poppins',sans-serif" }}>
                      {f.label}
                    </span>
                    <p style={{ fontSize: 14, color: "#444", marginTop: 3, lineHeight: 1.55, fontFamily: "'Poppins',sans-serif" }}>{f.val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("member");
  return view === "admin"
    ? <AdminView onBack={() => setView("member")} />
    : <MemberView onAdmin={() => setView("admin")} />;
}
