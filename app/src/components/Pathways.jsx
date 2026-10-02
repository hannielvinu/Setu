import { PATHWAYS } from "../data/demo.js";
import { stepTier } from "../engine/priority.js";
import { EMERGENCY_EXCLUSIONS } from "../engine/classifier.js";

const NEVER = ["Diagnosis", "Treatment recommendations", "Clinical decision support", "Clinical risk scoring", "Interpretation of medical data", "Autonomous clinical advice"];

export default function Pathways({ state, dispatch }) {
  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Pathways & safety</h1>
          <p className="lede">Everything here is owned by the clinical team. Change a tier and the worklist re-ranks instantly.</p>
        </div>
      </div>

      <div className="two">
        <div>
          {PATHWAYS.map((p) => (
            <div key={p.id} className="card pad">
              <div className="row between">
                <h3>{p.name}</h3>
                <span className="chip">{p.domain}</span>
              </div>
              <div className="sub">Grace period {p.graceDays} days</div>
              <table className="table compact">
                <thead><tr><th>Step</th><th className="num">Day</th><th>Follow-up tier</th></tr></thead>
                <tbody>
                  {p.steps.map((s) => (
                    <tr key={s.id}>
                      <td>{s.label}</td>
                      <td className="num">{s.dayOffset}</td>
                      <td>
                        <select className="select small" value={stepTier(p, s, state.tiers)} onChange={(e) => dispatch({ type: "SET_TIER", pathwayId: p.id, stepId: s.id, tier: Number(e.target.value) })} aria-label={`Tier for ${s.label}`}>
                          <option value={1}>1 · routine</option>
                          <option value={2}>2 · important</option>
                          <option value={3}>3 · time-critical</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div>
          <div className="card pad">
            <h3>Hospital emergency card</h3>
            <p className="sub">The hospital's existing “when to come to emergency” card. If a reply matches, Setu reads the hospital's instruction word for word and alerts the on-call nurse. Ambiguous matches are treated as emergencies.</p>
            {state.emergencyCard.map((item) => (
              <div key={item.id} className="card-item">
                <strong>{item.label}</strong>
                <div className="chips">{item.keywords.map((k) => <span key={k} className="chip small">{k}</span>)}</div>
              </div>
            ))}
            <div className="sub top-s">Clinician-reviewed exclusions: {EMERGENCY_EXCLUSIONS.join(", ")}</div>
          </div>

          <div className="card pad">
            <h3>Out of scope by design</h3>
            <ul className="never">
              {NEVER.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <p className="sub">The AI only (1) sorts replies into a fixed list of non-clinical barriers and (2) speaks pre-approved scripts. Scheduling, checklists and priority are deterministic rules.</p>
          </div>

          <div className="card pad">
            <h3>Privacy (DPDP)</h3>
            <ul className="plain dots">
              <li>Consent captured at enrolment: channels, language, time window, named caregivers</li>
              <li>Neutral sender name: messages never reveal the department or diagnosis</li>
              <li>Identity check (birth year or card digits) before any appointment detail</li>
              <li>Wrong person hears only “please ask them to call back”</li>
              <li>Six non-clinical fields stored; transcripts auto-deleted after the retention period</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
