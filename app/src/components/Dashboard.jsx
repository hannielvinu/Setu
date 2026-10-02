import { HISTORY } from "../data/demo.js";
import { BARRIERS } from "../engine/classifier.js";

const LABELS = { ...Object.fromEntries(Object.entries(BARRIERS).map(([k, v]) => [k, v.label])), other: "Other / unclear" };
const FUNNEL = [
  ["flagged", "Flagged overdue"],
  ["headsUp", "Heads-up sent"],
  ["reached", "Reached"],
  ["verified", "Identity verified"],
  ["barrierCaptured", "Barrier captured"],
  ["rebooked", "Rebooked"],
];
const ACTION = {
  paperwork: "Scheme paperwork is the top reason: consider extending help-desk hours or pre-filling scheme renewals at discharge.",
  travel: "Travel is the top reason: consider grouping visits for distant patients and sharing transport-assistance options.",
  money: "Cost is the top reason: route more patients to the scheme help desk at registration.",
  family: "Caregiver availability is the top reason: consider early-morning or weekend day-care slots.",
  felt_better: "'Felt better' is the top reason: strengthen the pathway explanation given at cycle 1.",
  fear: "Treatment worry is the top reason: consider a nurse counselling call before each cycle.",
  lodging: "Lodging is the top reason: expand the dharamshala partner list.",
  unaware: "Unawareness is the top reason: add a confirmation call the day before each visit.",
  other: "Many unclear reasons: review coordinator notes.",
};

export default function Dashboard({ state, worklist }) {
  const counts = { ...HISTORY.barrierCounts };
  for (const [k, v] of Object.entries(state.session.barrierCounts)) counts[k] = (counts[k] || 0) + v;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1];
  const top = sorted[0][0];

  const overdueNow = worklist.filter((r) => r.a.overdue).length;
  const funnel = { ...HISTORY.funnel };
  for (const [k, v] of Object.entries(state.session.funnel)) funnel[k] = (funnel[k] || 0) + v;
  funnel.flagged = HISTORY.funnel.flagged + state.calls.length;
  const fmax = funnel.flagged;
  const session = state.calls.length;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Why patients drop out</h1>
          <p className="lede">Synthetic 30-day baseline plus this demo session ({session} call{session === 1 ? "" : "s"} logged). A hospital would see its own data here.</p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi card"><span className="kpi-n">{overdueNow}</span><span className="kpi-l">Overdue today</span></div>
        <div className="kpi card"><span className="kpi-n">{funnel.reached}</span><span className="kpi-l">Patients reached (30 days)</span></div>
        <div className="kpi card"><span className="kpi-n">{funnel.rebooked}</span><span className="kpi-l">Rebooked (30 days)</span></div>
        <div className="kpi card"><span className="kpi-n">{Math.round((HISTORY.funnel.returned / HISTORY.funnel.flagged) * 100)}%</span><span className="kpi-l">Back in care within 30 days (baseline)</span></div>
        <div className="kpi card"><span className="kpi-n">{HISTORY.nurse.emergencies + state.session.emergencies}</span><span className="kpi-l">Emergency-card alerts</span></div>
      </div>

      <div className="dash-grid">
        <div className="card pad">
          <h3>Barriers captured</h3>
          <div className="bars">
            {sorted.map(([k, v]) => (
              <div key={k} className="bar-row">
                <span className="bar-label">{LABELS[k]}</span>
                <span className="bar-track"><span className={`bar-fill ${k === top ? "top" : ""}`} style={{ width: `${(v / max) * 100}%` }} /></span>
                <span className="bar-val">{v} <em>{Math.round((v / total) * 100)}%</em></span>
              </div>
            ))}
          </div>
          <div className="insight"><strong>Suggested operational action</strong><span>{ACTION[top]}</span></div>
        </div>

        <div className="card pad">
          <h3>Outreach funnel</h3>
          <div className="bars">
            {FUNNEL.map(([k, label]) => (
              <div key={k} className="bar-row">
                <span className="bar-label">{label}</span>
                <span className="bar-track"><span className="bar-fill alt" style={{ width: `${(funnel[k] / fmax) * 100}%` }} /></span>
                <span className="bar-val">{funnel[k]}</span>
              </div>
            ))}
          </div>
          <p className="note">Nurse queue baseline: {HISTORY.nurse.symptomNotes} symptom notes, median review {HISTORY.nurse.medianReviewSec}s per item (synthetic).</p>
        </div>
      </div>
    </section>
  );
}
