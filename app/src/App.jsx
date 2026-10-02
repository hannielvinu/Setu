import { useEffect, useMemo, useReducer, useState } from "react";
import { reducer, loadState, saveState, TODAY } from "./state.js";
import { PATHWAYS_BY_ID } from "./data/demo.js";
import { buildWorklist } from "./engine/priority.js";
import Worklist from "./components/Worklist.jsx";
import CallAgent from "./components/CallAgent.jsx";
import VerifyRegister from "./components/VerifyRegister.jsx";
import NurseQueue from "./components/NurseQueue.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Pathways from "./components/Pathways.jsx";

const TABS = [
  { id: "worklist", label: "Worklist" },
  { id: "call", label: "Outreach agent" },
  { id: "verify", label: "Verify register" },
  { id: "nurse", label: "Nurse queue" },
  { id: "dashboard", label: "Barrier dashboard" },
  { id: "pathways", label: "Pathways & safety" },
];

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : "worklist"));

  useEffect(() => {
    saveState(state);
  }, [state]);
  useEffect(() => {
    history.replaceState(null, "", `#${tab}`);
    window.scrollTo(0, 0);
  }, [tab]);

  const worklist = useMemo(() => buildWorklist(state.patients, PATHWAYS_BY_ID, TODAY, state.tiers), [state.patients, state.tiers]);
  const openNurse = state.nurseQueue.filter((n) => n.status === "open");
  const pendingRows = state.registerRows.filter((r) => r.status === "pending").length;

  const startOutreach = (id) => {
    dispatch({ type: "SELECT_PATIENT", id });
    setTab("call");
  };

  const badge = { nurse: openNurse.length, verify: pendingRows };

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="var(--teal)" />
            <path d="M12 40 Q32 14 52 40" stroke="var(--saffron-light)" strokeWidth="6" fill="none" strokeLinecap="round" />
          </svg>
          <div>
            <div className="brand-name">Setu</div>
            <div className="brand-sub">Cancer treatment dropout recovery · Arogya Hospital (demo)</div>
          </div>
        </div>
        <div className="top-actions">
          <span className="pill pill-warn">Synthetic demo data · fictional hospital</span>
          <button className="btn ghost" onClick={() => { if (confirm("Reset the demo to its starting state?")) dispatch({ type: "RESET" }); }}>Reset demo</button>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {badge[t.id] ? <span className={`count ${t.id === "nurse" && openNurse.some((n) => n.type === "emergency") ? "alert" : ""}`}>{badge[t.id]}</span> : null}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "worklist" && <Worklist worklist={worklist} onStart={startOutreach} />}
        {tab === "call" && <CallAgent state={state} dispatch={dispatch} worklist={worklist} goTo={setTab} />}
        {tab === "verify" && <VerifyRegister state={state} dispatch={dispatch} goTo={setTab} />}
        {tab === "nurse" && <NurseQueue state={state} dispatch={dispatch} />}
        {tab === "dashboard" && <Dashboard state={state} worklist={worklist} />}
        {tab === "pathways" && <Pathways state={state} dispatch={dispatch} />}
      </main>

      <footer className="foot">
        Setu is assistive: it does not diagnose, recommend treatment, score clinical risk, interpret medical data or give clinical advice.
        Team MedNova · Health-a-thon 2026 · <a href="https://github.com/hannielvinu/Setu" target="_blank" rel="noreferrer">Source on GitHub</a>
      </footer>
    </div>
  );
}
