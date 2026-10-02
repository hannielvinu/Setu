import { useState } from "react";
import { LEAFLETS } from "../data/demo.js";

const TYPE = {
  emergency: ["Emergency card match", "alert"],
  symptom: ["Symptom mentioned", "warn"],
  concern: ["Treatment worry", "teal"],
};

function ago(t) {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`;
}

export default function NurseQueue({ state, dispatch }) {
  const [leaflet, setLeaflet] = useState({});
  const order = { emergency: 0, symptom: 1, concern: 2 };
  const open = state.nurseQueue.filter((n) => n.status === "open").sort((a, b) => order[a.type] - order[b.type] || a.at - b.at);
  const done = state.nurseQueue.filter((n) => n.status === "done");
  const resolve = (id, resolution) => dispatch({ type: "NURSE_RESOLVE", id, resolution });

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Nurse queue</h1>
          <p className="lede">Anything clinical goes to a nurse. Setu records what was said; the nurse decides what happens next.</p>
        </div>
      </div>

      <div className="card tint formula">
        <strong>How items arrive</strong>
        <span>Emergency: a phrase matched the hospital's own emergency card, the script was read word for word and the on-call nurse was alerted. Symptom or worry: logged verbatim with no advice given. The agent never judges severity.</span>
      </div>

      {open.length === 0 && <div className="card pad empty-card">No open items. Try the Outreach agent and reply “I have had fever since yesterday” or “I feel very weak and tired”.</div>}

      {open.map((n) => {
        const [label, cls] = TYPE[n.type];
        return (
          <article key={n.id} className={`card nurse ${n.type}`}>
            <div className="nurse-head">
              <span className={`status ${cls}`}>{label}</span>
              <strong>{n.name}</strong>
              <span className="sub">{n.regNo} · {ago(n.at)}</span>
            </div>
            <blockquote>“{n.quote}”</blockquote>
            {n.matched && <div className="sub">Matched card item: {n.matched.join(", ")} (hospital emergency card). Emergency instruction already given on the call.</div>}
            <div className="row gap wrap top-s">
              <button className="btn small" onClick={() => resolve(n.id, "Nurse called back")}>Called back</button>
              <button className="btn small ghost" onClick={() => resolve(n.id, "Asked patient to visit")}>Asked to visit</button>
              <select className="select small" value={leaflet[n.id] || ""} onChange={(e) => setLeaflet({ ...leaflet, [n.id]: e.target.value })} aria-label="Hospital leaflet">
                <option value="">Choose hospital leaflet…</option>
                {LEAFLETS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <button className="btn small ghost" disabled={!leaflet[n.id]} onClick={() => resolve(n.id, `Nurse sent: ${leaflet[n.id]}`)}>Send leaflet</button>
            </div>
          </article>
        );
      })}

      {done.length > 0 && (
        <div className="card pad">
          <h3>Closed today</h3>
          <ul className="plain">
            {done.map((n) => <li key={n.id}><span className="status ok">done</span> {n.name}: {n.resolution} ({Math.max(1, Math.round((n.resolvedAt - n.at) / 1000))}s from arrival)</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
