import { useRef, useState } from "react";
import { PATHWAYS, PATHWAYS_BY_ID } from "../data/demo.js";
import { TODAY } from "../state.js";
import { FIELDS, LOW_CONFIDENCE, sanityIssues } from "../engine/verify.js";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split(",").map((h) => h.trim().toLowerCase());
  const col = (row, name) => row[head.indexOf(name)]?.trim() ?? "";
  return lines.map((line, i) => {
    const r = line.split(",");
    const fields = { regNo: col(r, "reg_no"), name: col(r, "name"), phone: col(r, "phone"), pathwayId: col(r, "pathway"), step: col(r, "step_no"), date: col(r, "last_visit_date") };
    return { id: `csv${Date.now()}${i}`, written: null, ocr: fields, fields, conf: {}, confirmed: {}, status: "pending", source: "CSV export" };
  });
}

export default function VerifyRegister({ state, dispatch, goTo }) {
  const [flash, setFlash] = useState("");
  const fileRef = useRef(null);
  const pending = state.registerRows.filter((r) => r.status === "pending");
  const done = state.registerRows.filter((r) => r.status !== "pending");

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const rows = parseCsv(await f.text());
      dispatch({ type: "IMPORT_ROWS", rows });
      setFlash(`${rows.length} rows imported from ${f.name}. Review each row before it enters the worklist.`);
    } catch {
      setFlash("Could not read that file. Expected columns: reg_no,name,phone,pathway,step_no,last_visit_date");
    }
    e.target.value = "";
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Verify register rows</h1>
          <p className="lede">Handwritten day-care registers are digitised to six non-clinical fields only. A clerk checks each row (about 10 seconds) before anyone is called.</p>
        </div>
        <div className="row gap">
          <a className="btn ghost" href="./sample_register.csv" download>Sample CSV</a>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import CSV export</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onFile} />
        </div>
      </div>

      <div className="chips bar">
        <span className="chip teal">Extracted: reg. no · name · phone · pathway · visit no. · last visit date</span>
        <span className="chip alert">Never extracted: drugs, doses, diagnoses, clinical values</span>
        <span className="chip warn">Amber = low OCR confidence, needs a look</span>
      </div>
      {flash && <div className="flash">{flash}</div>}

      {pending.length === 0 && <div className="card pad">All rows reviewed. <button className="btn small" onClick={() => goTo("worklist")}>Open worklist</button></div>}

      {pending.map((row) => {
        const issues = sanityIssues(row.fields, TODAY, PATHWAYS_BY_ID);
        const issueFields = new Set(issues.map((x) => x.field));
        const needsLook = FIELDS.filter((f) => (row.conf[f.key] ?? 1) < LOW_CONFIDENCE && !row.confirmed[f.key]).map((f) => f.key);
        const canApprove = issues.length === 0 && needsLook.length === 0;
        return (
          <article key={row.id} className="card verify">
            <div className="paper" aria-label="Cropped register row">
              <div className="paper-label">{row.written ? "Register photo · cropped row" : row.source}</div>
              {row.written ? (
                <div className="hand">
                  <span>{row.written.regNo}</span>
                  <span>{row.written.name}</span>
                  <span>{row.written.phone}</span>
                  <span>{row.written.pathwayId === "rt_course" ? "RT" : "Chemo"} #{row.written.step}</span>
                  <span>{row.written.date}</span>
                </div>
              ) : (
                <div className="sub">No image: structured export row</div>
              )}
            </div>
            <div className="fields">
              {FIELDS.map((f) => {
                const conf = row.conf[f.key];
                const low = conf !== undefined && conf < LOW_CONFIDENCE && !row.confirmed[f.key];
                const bad = issueFields.has(f.key);
                return (
                  <label key={f.key} className={`field ${bad ? "bad" : low ? "low" : ""}`}>
                    <span className="flabel">
                      {f.label}
                      {conf !== undefined && <em>{Math.round(conf * 100)}%</em>}
                    </span>
                    {f.key === "pathwayId" ? (
                      <select className="input" value={row.fields.pathwayId} onChange={(e) => dispatch({ type: "EDIT_ROW", id: row.id, field: f.key, value: e.target.value })}>
                        {PATHWAYS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ) : (
                      <input className="input" type={f.key === "date" ? "date" : "text"} value={row.fields[f.key]} onChange={(e) => dispatch({ type: "EDIT_ROW", id: row.id, field: f.key, value: e.target.value })} />
                    )}
                    {low && !bad && <button type="button" className="link" onClick={() => dispatch({ type: "CONFIRM_FIELD", id: row.id, field: f.key })}>Looks right</button>}
                  </label>
                );
              })}
            </div>
            <div className="verify-foot">
              <div>
                {issues.map((x) => <div key={x.field + x.msg} className="issue">⚠ {x.msg}</div>)}
                {!issues.length && needsLook.length > 0 && <div className="issue warn">Check the highlighted field against the handwriting.</div>}
                {canApprove && <div className="okmsg">✓ All checks pass</div>}
              </div>
              <div className="row gap">
                <button className="btn ghost" onClick={() => dispatch({ type: "REJECT_ROW", id: row.id })}>Reject row</button>
                <button className="btn" disabled={!canApprove} onClick={() => { dispatch({ type: "APPROVE_ROW", id: row.id }); setFlash(`${row.fields.name} approved and added to the follow-up worklist.`); }}>Approve row</button>
              </div>
            </div>
          </article>
        );
      })}

      {done.length > 0 && (
        <div className="card pad">
          <h3>Reviewed</h3>
          <ul className="plain">
            {done.map((r) => <li key={r.id}><span className={`status ${r.status === "approved" ? "ok" : "alert"}`}>{r.status}</span> {r.fields.name} · {r.fields.regNo} · {r.source}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
