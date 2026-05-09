import { useState, useEffect, useCallback } from "react";

const API = "https://script.google.com/macros/s/AKfycbxf4MT0tUFvWw1cD_hvinFYQ0pZet1Hgfv5cNl44BsUSDGXnLUGfd9uPrrr-2qdT0VBtg/exec";

const fetchSheet = async (sheet) => {
  try {
    const res = await fetch(`${API}?sheet=${encodeURIComponent(sheet)}`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

const postUpdate = async (sheet, row, rowIndex) => {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ sheet, row, rowIndex }),
    });
    return true;
  } catch (e) { return false; }
};

const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const daysUntil = (s) => { if (!s) return null; const d = new Date(s); d.setHours(0,0,0,0); return Math.round((d - TODAY) / 86400000); };
const fmt = (s) => { if (!s) return "—"; try { return new Date(s).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); } catch { return s; } };
const todayStr = () => TODAY.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

const ROLE_CONFIG = {
  Head:     { color:"#7C3AED", bg:"#EDE9FE", label:"Head",     icon:"◉" },
  Manager:  { color:"#B45309", bg:"#FEF3C7", label:"Manager",  icon:"◈" },
  Operator: { color:"#0369A1", bg:"#E0F2FE", label:"Operator", icon:"◎" },
  RDM:      { color:"#065F46", bg:"#D1FAE5", label:"RDM",      icon:"◆" },
  Staff:    { color:"#374151", bg:"#F3F4F6", label:"Staff",     icon:"○" },
  Viewer:   { color:"#6B7280", bg:"#F9FAFB", label:"Viewer",   icon:"◌" },
};

const STATUS = {
  Pending:   { bg:"#FEF3C7", color:"#92400E", dot:"#D97706", label:"Pending" },
  Planned:   { bg:"#DBEAFE", color:"#1E40AF", dot:"#3B82F6", label:"Planned" },
  Submitted: { bg:"#EDE9FE", color:"#5B21B6", dot:"#7C3AED", label:"Submitted" },
  Validated: { bg:"#D1FAE5", color:"#065F46", dot:"#10B981", label:"Validated" },
  Completed: { bg:"#D1FAE5", color:"#065F46", dot:"#10B981", label:"Completed" },
  Active:    { bg:"#D1FAE5", color:"#065F46", dot:"#10B981", label:"Active" },
  Expired:   { bg:"#FEE2E2", color:"#991B1B", dot:"#EF4444", label:"Expired" },
  Overdue:   { bg:"#FEE2E2", color:"#991B1B", dot:"#EF4444", label:"Overdue" },
};

const Dot = ({ color, size = 7 }) => (
  <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:color, flexShrink:0 }} />
);

const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.Pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, padding:"3px 9px", borderRadius:20, background:s.bg, color:s.color, fontWeight:600, whiteSpace:"nowrap" }}>
      <Dot color={s.dot} size={6} />{s.label}
    </span>
  );
};

// ── LOGIN SCREEN ──────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    const users = await fetchSheet("Users");
    const match = users.find(u =>
      String(u["Username"]).trim().toLowerCase() === username.trim().toLowerCase() &&
      String(u["Password"]).trim() === password.trim() &&
      String(u["Active (Yes/No)"]).trim() === "Yes"
    );
    if (match) {
      onLogin({ name: match["Full Name"], role: match["Role"], email: match["Email ID"], username: match["Username"] });
    } else {
      setError("Invalid credentials or account inactive. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:600, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, #0A1628 0%, #0F2744 50%, #0A1628 100%)", fontFamily:"'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width:"100%", maxWidth:380, padding:"0 20px" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.2em", color:"#F59E0B", textTransform:"uppercase", marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif" }}>Integrated Central Hub</div>
          <div style={{ fontSize:28, fontWeight:700, color:"white", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.02em" }}>ICH Dashboard</div>
          <div style={{ fontSize:12, color:"#64748B", marginTop:6 }}>AMC · Quality · Licenses</div>
        </div>

        <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:24, backdropFilter:"blur(10px)" }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#94A3B8", fontWeight:500, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Enter your username"
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"10px 14px", color:"white", fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:"none" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, color:"#94A3B8", fontWeight:500, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Enter your password"
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"10px 14px", color:"white", fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:"none" }} />
          </div>
          {error && <div style={{ fontSize:12, color:"#FCA5A5", marginBottom:14, padding:"8px 12px", background:"rgba(239,68,68,0.15)", borderRadius:6 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width:"100%", padding:"12px", background:"#F59E0B", border:"none", borderRadius:8, color:"#0A1628", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.05em", fontSize:15 }}>
            {loading ? "Signing in…" : "SIGN IN"}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:"#475569" }}>ICH Indore · Secure Access</div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState("amc");
  const [amcData, setAmcData]     = useState([]);
  const [licData, setLicData]     = useState([]);
  const [qualData, setQualData]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [modal, setModal]         = useState(null);
  const [comment, setComment]     = useState("");
  const [fileName, setFileName]   = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [filter, setFilter]       = useState("All");
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [amc, lic, qual] = await Promise.all([fetchSheet("AMC"), fetchSheet("Licenses"), fetchSheet("Quality")]);
    // Compute overdue
    const processedAmc = amc.map(t => {
      const days = daysUntil(t["Next Service Due Date"]);
      if (days !== null && days < 0 && t["Status"] === "Pending") return { ...t, Status: "Overdue" };
      return t;
    });
    const processedLic = lic.map(t => {
      if (t["Expiry Date"] && t["Expiry Date"] !== "Lifetime") {
        const days = daysUntil(t["Expiry Date"]);
        if (days !== null && days < 0 && t["Status"] === "Active") return { ...t, Status: "Expired" };
      }
      return t;
    });
    setAmcData(processedAmc);
    setLicData(processedLic);
    setQualData(qual);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const role = user.role;
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.Staff;
  const canValidate = role === "Manager";
  const canSetup    = role === "Manager" || role === "Operator";
  const canSignOff  = role === "RDM";
  const canSubmit   = role === "Staff" || role === "Operator";
  const isViewer    = role === "Head" || role === "Viewer";

  // Notifications
  const notifs = [
    ...amcData.filter(t => t["Status"] === "Overdue").map(t => ({ id:t["S.No"]+"_od", level:"danger", text:`${t["Equipment Name"]} is OVERDUE`, task:t, sheet:"AMC" })),
    ...amcData.filter(t => { const d = daysUntil(t["Next Service Due Date"]); return d !== null && d >= 0 && d <= 3 && t["Status"] === "Pending"; }).map(t => ({ id:t["S.No"]+"_soon", level:"warning", text:`${t["Equipment Name"]} due in ${daysUntil(t["Next Service Due Date"])===0?"today":`${daysUntil(t["Next Service Due Date"])}d`}`, task:t, sheet:"AMC" })),
    ...amcData.filter(t => t["Status"] === "Submitted").map(t => ({ id:t["S.No"]+"_sub", level:"info", text:`${t["Equipment Name"]} awaiting validation`, task:t, sheet:"AMC" })),
    ...amcData.filter(t => t["Status"] === "Validated" && !t["RDM Sign Off"]).map(t => ({ id:t["S.No"]+"_rdm", level:"success", text:`${t["Equipment Name"]} awaiting RDM sign-off`, task:t, sheet:"AMC" })),
    ...licData.filter(t => { const d = daysUntil(t["Expiry Date"]); return d !== null && d >= 0 && d <= 30; }).map(t => ({ id:"lic_"+t["S.No"], level:"warning", text:`License: ${t["License / Agreement Name"]} expiring in ${daysUntil(t["Expiry Date"])} days`, task:t, sheet:"Licenses" })),
  ].filter(n => !dismissed.includes(n.id));

  const criticals = notifs.filter(n => n.level === "danger");
  const notifCount = notifs.length;

  // Stats
  const amcOverdue   = amcData.filter(t => t["Status"] === "Overdue").length;
  const amcPending   = amcData.filter(t => t["Status"] === "Pending").length;
  const amcSubmitted = amcData.filter(t => t["Status"] === "Submitted").length;
  const licExpiring  = licData.filter(t => { const d = daysUntil(t["Expiry Date"]); return d !== null && d >= 0 && d <= 30; }).length;
  const licExpired   = licData.filter(t => t["Status"] === "Expired").length;

  const getActions = (task, sheet) => {
    const s = task["Status"];
    if (sheet === "AMC") {
      if (canSubmit && (s === "Pending" || s === "Overdue")) return [{ key:"plan", label:"Mark Planned", bg:"#3B82F6" }, { key:"submit", label:"Submit Evidence", bg:"#7C3AED" }];
      if (canValidate && s === "Submitted") return [{ key:"validate", label:"Validate & Close", bg:"#10B981" }, { key:"sendback", label:"Send Back", bg:"#EF4444" }];
      if (canSignOff && s === "Validated") return [{ key:"signoff", label:"RDM Sign Off", bg:"#0369A1" }];
    }
    if (sheet === "Licenses") {
      if (canSetup && (task["Status"] === "Expired" || (daysUntil(task["Expiry Date"]) !== null && daysUntil(task["Expiry Date"]) <= 30))) return [{ key:"renew", label:"Mark Renewed", bg:"#10B981" }];
    }
    return [];
  };

  const handleAction = async () => {
    if (!modal) return;
    const { task, key, sheet, rowIndex } = modal;
    const updated = { ...task };
    const now = todayStr();
    if (key === "plan")     { updated["Status"] = "Planned"; updated["Planned Date"] = plannedDate; updated["Planned By"] = user.name; }
    if (key === "submit")   { updated["Status"] = "Submitted"; updated["Evidence File"] = fileName || "evidence_uploaded.pdf"; updated["Submitted By"] = user.name; updated["Submitted On"] = now; }
    if (key === "validate") { updated["Status"] = "Validated"; updated["Validated By"] = user.name; updated["Validated On"] = now; updated["Remarks"] = comment; }
    if (key === "sendback") { updated["Status"] = "Pending"; updated["Remarks"] = `Sent back: ${comment}`; }
    if (key === "signoff")  { updated["Status"] = "Completed"; updated["Validated By"] = updated["Validated By"] || user.name; updated["Remarks"] = comment; }
    if (key === "renew")    { updated["Status"] = "Active"; updated["Remarks"] = `Renewed on ${now} by ${user.name}. ${comment}`; }
    await postUpdate(sheet, updated, rowIndex);
    await loadData();
    setModal(null); setComment(""); setFileName(""); setPlannedDate("");
  };

  const displayAmc  = filter === "All" ? amcData  : amcData.filter(t => t["Status"] === filter);
  const displayLic  = filter === "All" ? licData  : licData.filter(t => t["Status"] === filter);
  const displayQual = qualData.filter(t => t["Activity Name"] && t["Activity Type"]);

  const NOTIF_STYLE = {
    danger:  { bg:"#FEE2E2", color:"#991B1B", border:"#FCA5A5", dot:"#EF4444" },
    warning: { bg:"#FEF3C7", color:"#92400E", border:"#FCD34D", dot:"#F59E0B" },
    info:    { bg:"#EDE9FE", color:"#5B21B6", border:"#C4B5FD", dot:"#7C3AED" },
    success: { bg:"#D1FAE5", color:"#065F46", border:"#6EE7B7", dot:"#10B981" },
  };

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:"#F8FAFC", minHeight:700, position:"relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* ── MODAL ── */}
      {modal && (
        <div style={{ position:"absolute", inset:0, background:"rgba(10,22,40,0.6)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:100, paddingTop:60, backdropFilter:"blur(2px)" }}>
          <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:"1.5rem", width:"92%", maxWidth:460, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4, fontFamily:"'Barlow Condensed', sans-serif" }}>{modal.sheet} Activity</div>
                <div style={{ fontSize:17, fontWeight:600, color:"#0F172A" }}>{modal.task["Equipment Name"] || modal.task["License / Agreement Name"] || modal.task["Activity Name"]}</div>
              </div>
              <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#94A3B8" }}>✕</button>
            </div>

            <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" }}>
              {modal.task["Vendor Name"] && <div><span style={{color:"#64748B"}}>Vendor: </span><span style={{color:"#0F172A", fontWeight:500}}>{modal.task["Vendor Name"]}</span></div>}
              {modal.task["Next Service Due Date"] && <div><span style={{color:"#64748B"}}>Due: </span><span style={{color:"#0F172A", fontWeight:500}}>{fmt(modal.task["Next Service Due Date"])}</span></div>}
              {modal.task["Frequency"] && <div><span style={{color:"#64748B"}}>Frequency: </span><span style={{color:"#0F172A"}}>{modal.task["Frequency"]}</span></div>}
              <div><span style={{color:"#64748B"}}>Status: </span><Badge status={modal.task["Status"]} /></div>
              {modal.task["Vendor Contact Person"] && <div style={{gridColumn:"1/-1"}}><span style={{color:"#64748B"}}>Contact: </span><span style={{color:"#0F172A"}}>{modal.task["Vendor Contact Person"]} · {modal.task["Vendor Contact No"]}</span></div>}
            </div>

            {modal.task["Evidence File"] && (
              <div style={{ marginBottom:12, fontSize:12, background:"#EDE9FE", color:"#5B21B6", borderRadius:6, padding:"7px 12px" }}>
                Evidence on file: {modal.task["Evidence File"]}
              </div>
            )}
            {modal.task["Remarks"] && (
              <div style={{ marginBottom:10, fontSize:12, color:"#64748B", fontStyle:"italic" }}>Note: "{modal.task["Remarks"]}"</div>
            )}

            {modal.key === "plan" && (
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:"#64748B", display:"block", marginBottom:6, fontWeight:500 }}>Planned vendor visit date</label>
                <input type="date" value={plannedDate} onChange={e=>setPlannedDate(e.target.value)}
                  style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", border:"1px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"'DM Sans', sans-serif" }} />
              </div>
            )}

            {modal.key === "submit" && (
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:"#64748B", display:"block", marginBottom:6, fontWeight:500 }}>Evidence document filename</label>
                <input value={fileName} onChange={e=>setFileName(e.target.value)} placeholder="e.g. service_report_may2026.pdf"
                  style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", border:"1px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"'DM Sans', sans-serif" }} />
              </div>
            )}

            {(modal.key === "validate" || modal.key === "sendback" || modal.key === "signoff" || modal.key === "renew") && (
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, color:"#64748B", display:"block", marginBottom:6, fontWeight:500 }}>
                  {modal.key === "validate" ? "Validation remarks" : modal.key === "sendback" ? "Reason for sending back" : modal.key === "signoff" ? "RDM review notes" : "Renewal remarks"}
                </label>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add your remarks…" rows={3}
                  style={{ width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"'DM Sans', sans-serif", fontSize:13, padding:"9px 12px", border:"1px solid #E2E8F0", borderRadius:8, color:"#0F172A" }} />
              </div>
            )}

            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setModal(null)} style={{ padding:"8px 16px", fontSize:13, borderRadius:8, border:"1px solid #E2E8F0", background:"white", cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>Cancel</button>
              {modal.key === "plan"     && <button onClick={handleAction} style={{ padding:"8px 16px", fontSize:13, background:"#3B82F6", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500 }}>Confirm Plan</button>}
              {modal.key === "submit"   && <button onClick={handleAction} style={{ padding:"8px 16px", fontSize:13, background:"#7C3AED", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500 }}>Submit Evidence</button>}
              {modal.key === "validate" && <button onClick={handleAction} style={{ padding:"8px 16px", fontSize:13, background:"#10B981", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500 }}>Validate & Close</button>}
              {modal.key === "sendback" && <button onClick={handleAction} disabled={!comment} style={{ padding:"8px 16px", fontSize:13, background:"#EF4444", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500, opacity:comment?1:0.5 }}>Send Back</button>}
              {modal.key === "signoff"  && <button onClick={handleAction} style={{ padding:"8px 16px", fontSize:13, background:"#0369A1", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500 }}>RDM Sign Off</button>}
              {modal.key === "renew"    && <button onClick={handleAction} style={{ padding:"8px 16px", fontSize:13, background:"#10B981", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:500 }}>Confirm Renewal</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg, #0A1628 0%, #0F2744 100%)", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.15em", color:"#F59E0B", textTransform:"uppercase", fontFamily:"'Barlow Condensed', sans-serif", marginBottom:2 }}>Integrated Central Hub · ICH Indore</div>
          <div style={{ fontSize:20, fontWeight:700, color:"white", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.03em" }}>AMC & Quality Dashboard</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, padding:"4px 12px", borderRadius:20, background:rc.bg, color:rc.color, fontWeight:600 }}>{rc.icon} {role}</span>
          <span style={{ fontSize:12, color:"#94A3B8" }}>{user.name}</span>
          <div style={{ position:"relative" }}>
            <button onClick={()=>setNotifOpen(!notifOpen)} style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, cursor:"pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifCount > 0 && <span style={{ position:"absolute", top:3, right:3, width:16, height:16, background:"#EF4444", borderRadius:"50%", fontSize:9, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{notifCount > 9 ? "9+" : notifCount}</span>}
            </button>
          </div>
          <button onClick={()=>setUser(null)} style={{ fontSize:11, padding:"5px 12px", background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#FCA5A5", cursor:"pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding:"16px 20px" }}>

        {/* ── NOTIFICATION PANEL ── */}
        {notifOpen && (
          <div style={{ marginBottom:14, border:"1px solid #E2E8F0", borderRadius:10, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ padding:"10px 16px", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>Alerts & Notifications</span>
              <button onClick={()=>setNotifOpen(false)} style={{ background:"none", border:"none", fontSize:14, cursor:"pointer", color:"#94A3B8" }}>✕</button>
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding:"1.25rem", textAlign:"center", fontSize:13, color:"#94A3B8" }}>No alerts at this time.</div>
            ) : notifs.map(n => {
              const s = NOTIF_STYLE[n.level];
              const actions = n.task ? getActions(n.task, n.sheet) : [];
              return (
                <div key={n.id} style={{ padding:"10px 16px", background:s.bg, borderBottom:`1px solid ${s.border}`, display:"flex", alignItems:"center", gap:10 }}>
                  <Dot color={s.dot} size={8} />
                  <span style={{ fontSize:13, color:s.color, flex:1 }}>{n.text}</span>
                  <div style={{ display:"flex", gap:6 }}>
                    {actions.slice(0,1).map(a => (
                      <button key={a.key} onClick={()=>{ setModal({ task:n.task, key:a.key, sheet:n.sheet, rowIndex:n.task["S.No"]+1 }); setNotifOpen(false); }} style={{ fontSize:11, padding:"4px 10px", background:a.bg, color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>{a.label}</button>
                    ))}
                    <button onClick={()=>setDismissed([...dismissed, n.id])} style={{ fontSize:11, padding:"4px 10px", background:"transparent", border:`1px solid ${s.border}`, borderRadius:6, color:s.color, cursor:"pointer" }}>Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CRITICAL BANNER ── */}
        {criticals.length > 0 && !notifOpen && (
          <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
            <Dot color="#EF4444" size={8} />
            <span style={{ fontSize:13, color:"#991B1B", flex:1 }}><strong>{criticals.length} overdue {criticals.length===1?"activity":"activities"}</strong> — {criticals[0].text}</span>
            <button onClick={()=>setNotifOpen(true)} style={{ fontSize:12, padding:"4px 12px", background:"#991B1B", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>View All</button>
          </div>
        )}

        {/* ── KPI CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:10, marginBottom:18 }}>
          {[
            { label:"AMC Contracts",    value:amcData.length,  bg:"#EFF6FF", color:"#1D4ED8", border:"#BFDBFE" },
            { label:"AMC Overdue",      value:amcOverdue,      bg:"#FEE2E2", color:"#991B1B", border:"#FCA5A5" },
            { label:"Pending Approval", value:amcSubmitted,    bg:"#EDE9FE", color:"#5B21B6", border:"#C4B5FD" },
            { label:"Licenses Total",   value:licData.length,  bg:"#F0FDF4", color:"#166534", border:"#BBF7D0" },
            { label:"Expiring / Expired", value:licExpiring+licExpired, bg:"#FEF3C7", color:"#92400E", border:"#FCD34D" },
          ].map(c => (
            <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:c.color, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>{c.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:c.color, lineHeight:1, fontFamily:"'Barlow Condensed', sans-serif" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:"2px solid #E2E8F0", marginBottom:16 }}>
          {[
            { id:"amc",      label:`AMC (${amcData.length})` },
            { id:"licenses", label:`Licenses (${licData.length})` },
            { id:"quality",  label:`Quality (${qualData.filter(t=>t["Activity Name"]).length})` },
            { id:"alerts",   label:"Alerts", badge:notifCount },
          ].map(t => (
            <button key={t.id} onClick={()=>{ setTab(t.id); setFilter("All"); }} style={{
              padding:"9px 18px", fontSize:13, background:"transparent", border:"none", cursor:"pointer",
              borderBottom: tab===t.id ? "2px solid #F59E0B" : "2px solid transparent", marginBottom:-2,
              color: tab===t.id ? "#0F172A" : "#64748B", fontWeight: tab===t.id ? 600 : 400,
              fontFamily:"'DM Sans', sans-serif",
            }}>
              {t.label}
              {t.badge > 0 && <span style={{ marginLeft:6, background:"#EF4444", color:"white", borderRadius:10, fontSize:10, padding:"1px 6px", fontWeight:700 }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── FILTER PILLS ── */}
        {(tab === "amc" || tab === "licenses") && (
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {(tab === "amc" ? ["All","Pending","Planned","Submitted","Validated","Completed","Overdue"] : ["All","Active","Expired"]).map(f => (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"4px 12px", fontSize:12, borderRadius:20, cursor:"pointer",
                background: filter===f ? "#0F172A" : "white",
                color: filter===f ? "white" : "#64748B",
                border: filter===f ? "1px solid #0F172A" : "1px solid #E2E8F0",
                fontWeight: filter===f ? 500 : 400, fontFamily:"'DM Sans', sans-serif",
              }}>{f}</button>
            ))}
          </div>
        )}

        {loading && <div style={{ textAlign:"center", padding:"2rem", color:"#94A3B8", fontSize:13 }}>Loading data from Google Sheet…</div>}

        {/* ── AMC TAB ── */}
        {tab === "amc" && !loading && (
          <div>
            {displayAmc.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:"#94A3B8", fontSize:13 }}>No tasks match this filter.</div>}
            {displayAmc.map((task, idx) => {
              const days = daysUntil(task["Next Service Due Date"]);
              const isOverdue = task["Status"] === "Overdue";
              const isDueSoon = task["Status"] === "Pending" && days !== null && days >= 0 && days <= 3;
              const actions = getActions(task, "AMC");
              return (
                <div key={idx} style={{ border:`1px solid ${isOverdue?"#FCA5A5":isDueSoon?"#FCD34D":"#E2E8F0"}`, borderLeft:`3px solid ${isOverdue?"#EF4444":isDueSoon?"#F59E0B":task["Status"]==="Validated"||task["Status"]==="Completed"?"#10B981":task["Status"]==="Submitted"?"#7C3AED":"#CBD5E1"}`, borderRadius:8, padding:"12px 16px", marginBottom:8, background:"white" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                        <Badge status={task["Status"]} />
                        {isOverdue && <span style={{ fontSize:11, color:"#991B1B", fontWeight:600 }}>↑ {Math.abs(days)}d overdue</span>}
                        {isDueSoon && <span style={{ fontSize:11, color:"#92400E", fontWeight:600 }}>Due {days===0?"today":`in ${days}d`}</span>}
                        <span style={{ fontSize:11, color:"#94A3B8" }}>{task["Frequency"]}</span>
                      </div>
                      <div style={{ fontSize:15, fontWeight:600, color:"#0F172A", marginBottom:4 }}>{task["Equipment Name"]}</div>
                      <div style={{ fontSize:12, color:"#64748B", display:"flex", gap:14, flexWrap:"wrap" }}>
                        {task["Serial No"] && <span>S/N: {task["Serial No"]}</span>}
                        {task["Vendor Name"] && <span>Vendor: {task["Vendor Name"]}</span>}
                        {task["Next Service Due Date"] && <span>Due: {fmt(task["Next Service Due Date"])}</span>}
                        {task["AMC Period"] && <span>Period: {task["AMC Period"]}</span>}
                      </div>
                      {task["Planned Date"] && <div style={{ marginTop:5, fontSize:12, color:"#3B82F6" }}>Planned for: {fmt(task["Planned Date"])} by {task["Planned By"]}</div>}
                      {task["Evidence File"] && <div style={{ marginTop:5, fontSize:12, color:"#7C3AED", background:"#EDE9FE", display:"inline-block", padding:"3px 9px", borderRadius:6 }}>Evidence: {task["Evidence File"]}</div>}
                      {task["Submitted By"] && <div style={{ marginTop:4, fontSize:11, color:"#64748B" }}>Submitted by {task["Submitted By"]} on {fmt(task["Submitted On"])}</div>}
                      {task["Validated By"] && <div style={{ marginTop:3, fontSize:11, color:"#065F46" }}>Validated by {task["Validated By"]} on {fmt(task["Validated On"])}</div>}
                      {task["Remarks"] && <div style={{ marginTop:4, fontSize:12, color:"#64748B", fontStyle:"italic" }}>"{task["Remarks"]}"</div>}
                    </div>
                    {!isViewer && actions.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexDirection:"column", flexShrink:0 }}>
                        {actions.map(a => (
                          <button key={a.key} onClick={()=>setModal({ task, key:a.key, sheet:"AMC", rowIndex:idx+2 })} style={{ fontSize:12, padding:"6px 12px", background:a.bg, color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:500, whiteSpace:"nowrap" }}>{a.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LICENSES TAB ── */}
        {tab === "licenses" && !loading && (
          <div>
            {displayLic.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:"#94A3B8", fontSize:13 }}>No licenses match this filter.</div>}
            {displayLic.map((lic, idx) => {
              const days = daysUntil(lic["Expiry Date"]);
              const isExpired = lic["Status"] === "Expired";
              const isUrgent  = days !== null && days >= 0 && days <= 30;
              const actions   = getActions(lic, "Licenses");
              return (
                <div key={idx} style={{ border:`1px solid ${isExpired?"#FCA5A5":isUrgent?"#FCD34D":"#E2E8F0"}`, borderLeft:`3px solid ${isExpired?"#EF4444":isUrgent?"#F59E0B":"#10B981"}`, borderRadius:8, padding:"12px 16px", marginBottom:8, background:"white" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                        <Badge status={lic["Status"]} />
                        {isUrgent && !isExpired && <span style={{ fontSize:11, color:"#92400E", fontWeight:600 }}>Expiring in {days} days</span>}
                        {isExpired && <span style={{ fontSize:11, color:"#991B1B", fontWeight:600 }}>EXPIRED</span>}
                      </div>
                      <div style={{ fontSize:15, fontWeight:600, color:"#0F172A", marginBottom:4 }}>{lic["License / Agreement Name"]}</div>
                      <div style={{ fontSize:12, color:"#64748B", display:"flex", gap:14, flexWrap:"wrap" }}>
                        {lic["Company"] && <span>Company: {lic["Company"]}</span>}
                        {lic["License No / Key"] && <span>No: {lic["License No / Key"]}</span>}
                        {lic["Expiry Date"] && <span>Expires: {fmt(lic["Expiry Date"])}</span>}
                        {lic["Renewal Due Date"] && <span>Renewal Due: {fmt(lic["Renewal Due Date"])}</span>}
                      </div>
                      {lic["Contact Person"] && <div style={{ marginTop:4, fontSize:12, color:"#64748B" }}>Contact: {lic["Contact Person"]} · {lic["Contact No"]}</div>}
                      {lic["Remarks"] && <div style={{ marginTop:4, fontSize:12, color:"#64748B", fontStyle:"italic" }}>"{lic["Remarks"]}"</div>}
                    </div>
                    {!isViewer && actions.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        {actions.map(a => (
                          <button key={a.key} onClick={()=>setModal({ task:lic, key:a.key, sheet:"Licenses", rowIndex:idx+2 })} style={{ fontSize:12, padding:"6px 12px", background:a.bg, color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:500 }}>{a.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── QUALITY TAB ── */}
        {tab === "quality" && !loading && (
          <div>
            {["Training","Daily Housekeeping","Fortnightly Housekeeping"].map(section => {
              const items = displayQual.filter(t => t["Activity Type"] === section);
              if (items.length === 0) return null;
              return (
                <div key={section} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, fontFamily:"'Barlow Condensed', sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ display:"inline-block", width:20, height:2, background:"#F59E0B" }}></span>
                    {section}
                    <span style={{ display:"inline-block", flex:1, height:1, background:"#E2E8F0" }}></span>
                  </div>
                  {items.map((task, idx) => {
                    const actions = !isViewer && canSubmit ? [{ key:"submit_qual", label:"Submit", bg:"#7C3AED" }] : [];
                    return (
                      <div key={idx} style={{ border:"1px solid #E2E8F0", borderLeft:"3px solid #7C3AED", borderRadius:8, padding:"12px 16px", marginBottom:8, background:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, color:"#0F172A", marginBottom:3 }}>{task["Activity Name"]}</div>
                          <div style={{ fontSize:12, color:"#64748B", display:"flex", gap:12, flexWrap:"wrap" }}>
                            {task["Description"] && <span>{task["Description"]}</span>}
                            {task["Frequency"] && <span>· {task["Frequency"]}</span>}
                            {task["Assigned To"] && <span>· {task["Assigned To"]}</span>}
                          </div>
                        </div>
                        <Badge status={task["Status"] || "Pending"} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {tab === "alerts" && (
          <div>
            {notifs.length === 0 ? (
              <div style={{ padding:"3rem", textAlign:"center", color:"#94A3B8", fontSize:14 }}>No active alerts. All activities are on track.</div>
            ) : notifs.map(n => {
              const s = NOTIF_STYLE[n.level];
              const actions = n.task ? getActions(n.task, n.sheet) : [];
              return (
                <div key={n.id} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:8, padding:"12px 16px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:12 }}>
                  <Dot color={s.dot} size={8} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:s.color, fontWeight:600 }}>{n.text}</div>
                    {n.task && <div style={{ fontSize:11, color:s.color, opacity:0.75, marginTop:2 }}>{n.task["Vendor Name"] || ""} · {fmt(n.task["Next Service Due Date"] || n.task["Expiry Date"])}</div>}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {actions.slice(0,1).map(a => (
                      <button key={a.key} onClick={()=>setModal({ task:n.task, key:a.key, sheet:n.sheet, rowIndex:n.task["S.No"]+1 })} style={{ fontSize:12, padding:"5px 12px", background:a.bg, color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:500 }}>{a.label}</button>
                    ))}
                    <button onClick={()=>setDismissed([...dismissed, n.id])} style={{ fontSize:12, padding:"5px 10px", background:"transparent", border:`1px solid ${s.border}`, borderRadius:6, color:s.color, cursor:"pointer" }}>Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ padding:"12px 20px", borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", fontSize:11, color:"#94A3B8", background:"white" }}>
        <span>ICH Integrated Central Hub · Indore</span>
        <span>{todayStr()}</span>
      </div>
    </div>
  );
}
