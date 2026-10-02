import { useState } from "react";
import { PATHWAYS_BY_ID } from "../data/demo.js";
import { fmt } from "../engine/dates.js";

const STATUS = {
  open: ["Not contacted", ""],
  rebooked: ["Rebooked", "ok"],
  emergency: ["Emergency alert sent", "alert"],
  unverified: ["Could not verify", "warn"],
  handover: ["With coordinator", "warn"],
  callback: ["Awaiting callback", "warn"],
};

export default function Worklist({ worklist, onStart }) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? worklist : worklist.filter((r) => r.a.overdue);
  const overdue = worklist.filter((r) => r.a.overdue);
  const open = overdue.filter((r) => r.patient.status === "open").length;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Today's follow-up worklist</h1>
          <p className="lede">
            {overdue.length} patients are overdue for a planned visit; {open} not yet contacted. Ranked by operational priority, not clinical risk.
          </p>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show patients not yet due
        </label>
      </div>

      <div className="formula card tint">
        <strong>Priority = days overdue × clinician tier × (1 + 0.5 × past misses)</strong>
        <span>Tier is set per pathway step by the clinical team (Pathways & safety tab). No diagnosis, lab value or clinical data is used.</span>
      </div>

      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Pathway step</th>
              <th>Due</th>
              <th className="num">Days overdue</th>
              <th className="num">Tier</th>
              <th className="num">Past misses</th>
              <th className="num">Priority</th>
              <th>Distance</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ patient: p, a }, i) => {
              const [label, cls] = STATUS[p.status] || STATUS.open;
              return (
                <tr key={p.id} className={a.overdue ? "" : "muted"}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="strong">{p.name}</div>
                    <div className="sub">
                      {p.regNo}
                      {p.age ? ` · ${p.age}${p.sex}` : ""} · {p.language === "hi" ? "Hindi" : "English"}
                    </div>
                  </td>
                  <td>
                    <div>{a.step.label}</div>
                    <div className="sub">{PATHWAYS_BY_ID[p.pathwayId].name} · step {a.stepNumber}/{a.totalSteps}</div>
                  </td>
                  <td>{fmt(a.due)}</td>
                  <td className="num">{a.overdue ? <span className="strong">{a.daysOverdue}</span> : "-"}</td>
                  <td className="num"><span className={`tier t${a.tier}`}>{a.tier}</span></td>
                  <td className="num">{p.pastMisses}</td>
                  <td className="num"><span className="prio">{a.priority}</span></td>
                  <td>{p.distanceKm ? `${p.distanceKm} km` : "-"}</td>
                  <td><span className={`status ${cls}`}>{label}</span></td>
                  <td>
                    {a.overdue && p.status === "open" && (
                      <button className="btn small" onClick={() => onStart(p.id)}>Start outreach</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note">Data source per patient: hospital appointment export or a clerk-verified register row. Setu needs no EMR integration.</p>
    </section>
  );
}
