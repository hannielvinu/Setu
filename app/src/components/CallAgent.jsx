import { useEffect, useMemo, useRef, useState } from "react";
import { PATHWAYS_BY_ID } from "../data/demo.js";
import { TODAY } from "../state.js";
import { assess } from "../engine/priority.js";
import { classify, BARRIERS, matches } from "../engine/classifier.js";
import { SCRIPTS, say, QUICK_REPLIES, HUMAN_REQUEST, WHATSAPP_TEMPLATES } from "../engine/scripts.js";
import { fmt, fromISO } from "../engine/dates.js";

const STAGES = [
  ["headsup", "Heads-up"],
  ["greet", "Call"],
  ["verify", "Identity check"],
  ["ask", "Barrier"],
  ["slot", "Resolve"],
  ["done", "Logged"],
];
const STAGE_INDEX = { idle: -1, headsup: 0, greet: 1, verify: 2, ask: 3, askMore: 3, slot: 4, done: 5 };
const HI_REL = { son: "बेटा", daughter: "बेटी", wife: "पत्नी", husband: "पति", brother: "भाई" };
const RESOLVING = ["money", "paperwork", "travel", "lodging", "family", "felt_better", "unaware"];

function speakLine(text, lang) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    const voice = synth.getVoices().find((v) => v.lang === u.lang) || synth.getVoices().find((v) => v.lang.startsWith(lang));
    if (voice) u.voice = voice;
    u.rate = 0.92;
    synth.speak(u);
  } catch {
    /* speech not available */
  }
}

export default function CallAgent({ state, dispatch, worklist, goTo }) {
  const candidates = worklist.filter((r) => r.a.overdue);
  const fallbackId = candidates.find((r) => r.patient.status === "open")?.patient.id || candidates[0]?.patient.id;
  const patientId = state.selectedPatientId && state.patients.some((p) => p.id === state.selectedPatientId) ? state.selectedPatientId : fallbackId;
  const patient = state.patients.find((p) => p.id === patientId);
  const pathway = patient && PATHWAYS_BY_ID[patient.pathwayId];
  const a = patient && assess(patient, pathway, TODAY, state.tiers);

  const [lang, setLang] = useState(patient?.language || "hi");
  const [voiceOn, setVoiceOn] = useState(false);
  const [stage, setStage] = useState("idle");
  const [channel, setChannel] = useState("voice");
  const [msgs, setMsgs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [identity, setIdentity] = useState("unverified");
  const [found, setFound] = useState({ barriers: [], symptoms: [], emergency: [] });
  const [actions, setActions] = useState([]);
  const [path, setPath] = useState([]);
  const [draft, setDraft] = useState("");
  const [lastPrompt, setLastPrompt] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    setLang(patient?.language || "hi");
    setStage("idle");
    setChannel("voice");
    setMsgs([]);
    setAttempts(0);
    setIdentity("unverified");
    setFound({ barriers: [], symptoms: [], emergency: [] });
    setActions([]);
    setPath([]);
    setLastPrompt(null);
  }, [patientId]);

  useEffect(() => {
    const body = endRef.current?.parentElement;
    if (body) body.scrollTop = body.scrollHeight;
  }, [msgs]);

  const vars = useMemo(
    () => (patient && a ? { first: patient.firstName, due: fmt(a.due, lang), remaining: a.totalSteps - patient.completedSteps } : {}),
    [patient, a, lang]
  );

  if (!patient) return <section><h1>No overdue patients</h1></section>;

  const cg = patient.caregivers[0];
  const add = (m) => setMsgs((xs) => [...xs, ...(Array.isArray(m) ? m : [m])]);
  const act = (text) => setActions((xs) => [...xs, { text, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
  const botLine = (line, extra = {}) => {
    const text = say(line, lang, { ...vars, ...extra });
    if (voiceOn && channel === "voice") speakLine(text, lang);
    return { from: "bot", text, channel, voiceNote: channel === "whatsapp" };
  };
  const prompt = (line, extra) => {
    setLastPrompt({ line, extra });
    return botLine(line, extra);
  };

  function finish(outcome, barriers = found.barriers) {
    setStage("done");
    const statusMap = { rebooked: "rebooked", emergency: "emergency", unverified: "unverified", handover: "handover", callback: "callback" };
    dispatch({ type: "UPDATE_PATIENT", id: patient.id, patch: { status: statusMap[outcome] || "handover" } });
    dispatch({
      type: "LOG_CALL",
      call: { patientId: patient.id, name: patient.name, outcome, barriers: barriers.length ? barriers : outcome === "handover" ? ["other"] : [], path: [...path, channel] },
    });
    act(`Call logged: ${outcome}`);
  }

  function sendHeadsUp() {
    const viaWhatsApp = patient.consent.whatsapp;
    add({ from: "system", channel: viaWhatsApp ? "whatsapp" : "sms", template: true, sender: viaWhatsApp ? `${say({ en: "{hospital} Care Desk" }, "en")} (verified business)` : "AROGYA-CARE (DLT-registered sender)", text: say(SCRIPTS.headsup, lang, vars) });
    act(`Heads-up sent by ${viaWhatsApp ? "WhatsApp template" : "DLT-registered SMS"} · neutral sender name`);
    setPath(["heads-up"]);
    setStage("headsup");
    dispatch({ type: "FUNNEL", key: "headsUp" });
  }

  function placeCall() {
    setChannel("voice");
    add({ from: "system", text: `Calling ${patient.phone} from the hospital care-desk number (verified caller ID) in the patient's preferred time window` });
    setTimeout(() => {
      add(prompt(SCRIPTS.greet));
      setStage("greet");
      dispatch({ type: "FUNNEL", key: "reached" });
      act("Call connected");
    }, 350);
  }

  function dropCall() {
    add({ from: "system", text: "Call dropped." });
    act("Voice call dropped");
    if (patient.consent.whatsapp) {
      setChannel("whatsapp");
      setPath((p) => [...p, "voice (dropped)"]);
      add({ from: "system", text: "Fallback: continuing as a WhatsApp flow with voice notes in the patient's language." });
      act("Fallback → WhatsApp voice-note flow");
      if (lastPrompt) {
        const text = say(lastPrompt.line, lang, { ...vars, ...(lastPrompt.extra || {}) });
        add({ from: "bot", text, channel: "whatsapp", voiceNote: true });
      }
    } else {
      add({ from: "system", channel: "sms", text: "No WhatsApp on file → SMS sent: \"Please give a missed call to the care-desk number and we will call you back.\"" });
      act("Fallback → SMS with missed-call callback");
      finish("callback");
    }
  }

  function handleBarrierReply(text, isFollowUp) {
    const r = classify(text, state.emergencyCard);
    const nextFound = {
      barriers: [...new Set([...found.barriers, ...r.barriers])],
      symptoms: [...new Set([...found.symptoms, ...r.symptoms])],
      emergency: [...found.emergency, ...r.emergency],
    };
    setFound(nextFound);

    if (r.emergency.length) {
      add(botLine(SCRIPTS.emergency));
      dispatch({ type: "NURSE_ADD", item: { type: "emergency", patientId: patient.id, name: patient.name, regNo: patient.regNo, quote: text, matched: r.emergency.map((e) => e.label) } });
      act(`EMERGENCY CARD MATCH: ${r.emergency.map((e) => e.label).join(", ")} → hospital script read, on-call nurse alerted`);
      finish("emergency", nextFound.barriers);
      return;
    }

    const out = [];
    if (r.symptoms.length) {
      out.push(botLine(SCRIPTS.symptom));
      dispatch({ type: "NURSE_ADD", item: { type: "symptom", patientId: patient.id, name: patient.name, regNo: patient.regNo, quote: text } });
      act("Symptom mentioned → logged verbatim to nurse queue (no advice given)");
    }

    const fresh = r.barriers.slice(0, 3);
    let checklistSent = false;
    let lodgingSent = false;
    for (const b of fresh) {
      out.push(botLine(SCRIPTS.barrier[b]));
      if ((b === "paperwork" || b === "money") && !checklistSent) {
        checklistSent = true;
        out.push({ from: "system", channel: "whatsapp", sender: "Care Desk", list: WHATSAPP_TEMPLATES.paperwork, text: "Scheme document checklist" });
        act("WhatsApp: scheme document checklist sent; scheme help desk notified");
      }
      if ((b === "travel" || b === "lodging") && !lodgingSent) {
        lodgingSent = true;
        out.push({ from: "system", channel: "whatsapp", sender: "Care Desk", list: WHATSAPP_TEMPLATES.lodging, text: "Low-cost stay near the hospital" });
        act("WhatsApp: lodging list shared");
      }
      if (b === "family") act("Caregiver-friendly slots offered; caregiver will be copied");
      if (b === "fear") {
        dispatch({ type: "NURSE_ADD", item: { type: "concern", patientId: patient.id, name: patient.name, regNo: patient.regNo, quote: text } });
        act("Treatment worry → nurse callback requested");
      }
    }

    if (fresh.some((b) => RESOLVING.includes(b)) || (isFollowUp && !r.barriers.length && !r.symptoms.length)) {
      out.push(prompt(SCRIPTS.offerSlot));
      add(out);
      setStage("slot");
      return;
    }
    if (r.symptoms.length && !fresh.length && !isFollowUp) {
      out.push(prompt(SCRIPTS.askMore));
      add(out);
      setStage("askMore");
      return;
    }
    if (fresh.length) {
      add(out);
      finish("handover", nextFound.barriers);
      return;
    }
    out.push(botLine(SCRIPTS.unknown));
    add(out);
    act("Unclear reason → handed to care coordinator");
    finish("handover", ["other"]);
  }

  function onReply(textIn) {
    const text = textIn.trim();
    if (!text || stage === "done" || stage === "idle" || stage === "headsup") return;
    add({ from: "user", text, channel });
    setDraft("");

    if (stage !== "greet" && HUMAN_REQUEST.some((k) => matches(text, k))) {
      add(botLine(SCRIPTS.human));
      act("Patient asked for a person → warm transfer to coordinator");
      finish("handover");
      return;
    }

    if (stage === "greet") {
      if (/(wrong|someone else|galat|गलत|don't know|nahi jaant)/i.test(text)) {
        add(botLine(SCRIPTS.wrongPerson));
        act("Not the patient or a registered caregiver → nothing disclosed");
        finish("unverified");
        return;
      }
      add(prompt(SCRIPTS.verify));
      setStage("verify");
      return;
    }

    if (stage === "verify") {
      const cardLast4 = patient.regNo.replace(/\D/g, "").slice(-4);
      const ok = (patient.birthYear && text.includes(String(patient.birthYear))) || text.replace(/\D/g, "").endsWith(cardLast4);
      if (ok) {
        setIdentity("verified");
        dispatch({ type: "FUNNEL", key: "verified" });
        act("Identity confirmed → appointment details may be discussed");
        add(prompt(SCRIPTS.ask));
        setStage("ask");
      } else if (attempts === 0) {
        setAttempts(1);
        add(prompt(SCRIPTS.verifyRetry));
      } else {
        setIdentity("failed");
        add(botLine(SCRIPTS.verifyFailed));
        act("Identity check failed twice → nothing disclosed");
        finish("unverified");
      }
      return;
    }

    if (stage === "ask") return handleBarrierReply(text, false);
    if (stage === "askMore") return handleBarrierReply(text, true);
  }

  function book(slot) {
    if (stage !== "slot") return;
    const label = `${fmt(fromISO(slot.date), lang)}, ${slot.time}`;
    add({ from: "user", text: label, channel });
    dispatch({ type: "BOOK_SLOT", slotId: slot.id, patientId: patient.id });
    dispatch({ type: "FUNNEL", key: "rebooked" });
    add([
      botLine(SCRIPTS.booked, { slot: label }),
      { from: "system", channel: "whatsapp", sender: "Care Desk", text: `Appointment confirmed: ${label} · ${slot.chair}. Reply 1 to confirm, 2 to change.` },
      botLine(SCRIPTS.close),
    ]);
    act(`Booked ${slot.reason.toLowerCase()} slot ${label} (${slot.chair}); confirmation sent`);
    finish("rebooked");
  }

  const greetChips = lang === "hi"
    ? [`हाँ, मैं ${patient.firstName} बोल ${patient.sex === "M" ? "रहा" : "रही"} हूँ`, cg ? `मैं ${cg.name} हूँ, ${patient.firstName} जी ${HI_REL[cg.relation] ? `${["son", "husband", "brother"].includes(cg.relation) ? "का" : "की"} ${HI_REL[cg.relation]}` : "के परिवार से"}` : null, "गलत नंबर है"]
    : [`Yes, this is ${patient.firstName}`, cg ? `I'm ${cg.name}, ${patient.firstName}'s ${cg.relation}` : null, "Wrong number, I don't know them"];
  const verifyChips = [patient.birthYear ? String(patient.birthYear) : patient.regNo.replace(/\D/g, "").slice(-4), "1990"];
  const chips = stage === "greet" ? greetChips.filter(Boolean) : stage === "verify" ? verifyChips : stage === "ask" || stage === "askMore" ? QUICK_REPLIES[lang] : [];
  const freeSlots = state.slots.filter((s) => !s.taken).slice(0, 4);
  const si = STAGE_INDEX[stage];

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Outreach agent</h1>
          <p className="lede">Role-play the patient or caregiver: type a reply or tap a suggestion. The agent speaks only clinician-approved scripts.</p>
        </div>
        <div className="row gap">
          <select className="select" value={patient.id} onChange={(e) => dispatch({ type: "SELECT_PATIENT", id: e.target.value })} aria-label="Patient">
            {candidates.map(({ patient: p, a: x }) => (
              <option key={p.id} value={p.id}>{p.name} · {x.daysOverdue}d overdue{p.status !== "open" ? " · done" : ""}</option>
            ))}
          </select>
          <div className="seg" role="group" aria-label="Language">
            <button className={lang === "hi" ? "on" : ""} onClick={() => setLang("hi")}>हिन्दी</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
          </div>
          <label className="toggle"><input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} /> Speak aloud</label>
        </div>
      </div>

      <ol className="stepper">
        {STAGES.map(([id, label], i) => (
          <li key={id} className={i < si ? "done" : i === si ? "now" : ""}>{label}</li>
        ))}
      </ol>

      <div className="call-grid">
        <aside className="card pad">
          <h3>{patient.name}</h3>
          <div className="sub">{patient.regNo} · {patient.age ? `${patient.age}${patient.sex} · ` : ""}{patient.distanceKm ? `${patient.distanceKm} km away` : "distance unknown"}</div>
          <dl className="facts">
            <dt>Next step</dt><dd>{a.step.label}</dd>
            <dt>Was due</dt><dd>{fmt(a.due)} ({a.daysOverdue} days overdue)</dd>
            <dt>Priority</dt><dd>{a.daysOverdue} × tier {a.tier} × (1 + 0.5 × {patient.pastMisses}) = <strong>{a.priority}</strong></dd>
            <dt>Caregiver</dt><dd>{cg ? `${cg.name} (${cg.relation}), registered` : "None registered"}</dd>
          </dl>
          <h4>Consent on file</h4>
          <div className="chips">
            <span className="chip ok">Voice call</span>
            <span className={`chip ${patient.consent.whatsapp ? "ok" : "off"}`}>WhatsApp</span>
            <span className="chip ok">SMS</span>
            <span className="chip">Neutral sender name</span>
          </div>
          <div className="controls">
            <button className="btn" disabled={stage !== "idle"} onClick={sendHeadsUp}>1 · Send heads-up</button>
            <button className="btn" disabled={stage !== "headsup"} onClick={placeCall}>2 · Place call</button>
            <button className="btn ghost" disabled={channel !== "voice" || !["greet", "verify", "ask", "askMore", "slot"].includes(stage)} onClick={dropCall}>Simulate call drop</button>
          </div>
          {stage === "done" && (
            <div className="done-box">
              <strong>Call logged.</strong> Patient status updated on the worklist.
              <div className="row gap top-s">
                <button className="btn small" onClick={() => goTo("worklist")}>Back to worklist</button>
                {state.nurseQueue.some((n) => n.status === "open" && n.patientId === patient.id) && <button className="btn small alert" onClick={() => goTo("nurse")}>Open nurse queue</button>}
              </div>
            </div>
          )}
        </aside>

        <div className={`phone ${channel}`}>
          <div className="phone-bar">
            <span>{channel === "voice" ? "📞 Voice call" : channel === "whatsapp" ? "WhatsApp · Care Desk" : "SMS"}</span>
            <span className="sub light">{lang === "hi" ? "Hindi" : "English"}</span>
          </div>
          <div className="phone-body" aria-live="polite">
            {msgs.length === 0 && <div className="empty">Start with “Send heads-up”.</div>}
            {msgs.map((m, i) =>
              m.from === "system" ? (
                m.channel === "whatsapp" || m.channel === "sms" ? (
                  <div key={i} className={`wa ${m.channel}`}>
                    <div className="wa-sender">{m.sender || (m.channel === "sms" ? "SMS" : "WhatsApp")}</div>
                    <div>{m.text}</div>
                    {m.list && <ul>{m.list.map((x) => <li key={x}>{x}</li>)}</ul>}
                  </div>
                ) : (
                  <div key={i} className="sys">{m.text}</div>
                )
              ) : (
                <div key={i} className={`bubble ${m.from}`} lang={lang === "hi" ? "hi" : "en"}>
                  {m.voiceNote && <div className="vn">▶ <span className="wave" /> voice note</div>}
                  {m.text}
                </div>
              )
            )}
            {stage === "slot" && (
              <div className="slots">
                {freeSlots.map((s) => (
                  <button key={s.id} className="slot" onClick={() => book(s)}>
                    <strong>{fmt(fromISO(s.date), lang)} · {s.time}</strong>
                    <span>{s.chair} · {s.reason}</span>
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="phone-input">
            <div className="chips wrap">
              {chips.map((c) => (
                <button key={c} className="chip btn-chip" onClick={() => onReply(c)} lang={lang === "hi" ? "hi" : "en"}>{c}</button>
              ))}
            </div>
            <form className="row" onSubmit={(e) => { e.preventDefault(); onReply(draft); }}>
              <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={["greet", "verify", "ask", "askMore"].includes(stage) ? "Type as the patient or caregiver…" : "…"} disabled={!["greet", "verify", "ask", "askMore"].includes(stage)} />
              <button className="btn" disabled={!draft.trim()}>Send</button>
            </form>
          </div>
        </div>

        <aside className="card pad">
          <h3>Agent panel</h3>
          <div className="kv"><span>Identity</span><span className={`status ${identity === "verified" ? "ok" : identity === "failed" ? "alert" : "warn"}`}>{identity === "verified" ? "Verified" : identity === "failed" ? "Failed: nothing disclosed" : "Not verified"}</span></div>
          <div className="kv"><span>Disclosure</span><span>{identity === "verified" ? "Appointment details" : "Hospital + appointment only"}</span></div>

          <h4>What the agent heard</h4>
          {found.emergency.length > 0 && (
            <div className="chips">{found.emergency.map((e, i) => <span key={i} className="chip alert">Emergency card: {e.label}</span>)}</div>
          )}
          {found.symptoms.length > 0 && <div className="chips"><span className="chip warn">Symptom mentioned → nurse</span></div>}
          <div className="chips">
            {found.barriers.map((b) => <span key={b} className="chip teal">{BARRIERS[b].label}</span>)}
            {!found.barriers.length && !found.symptoms.length && !found.emergency.length && <span className="sub">Nothing yet</span>}
          </div>
          <p className="note">Demo classifier: transparent keyword rules (EN/HI). Production: Sarvam LLM restricted to the same fixed labels, with the emergency-card check always running alongside.</p>

          <h4>Actions</h4>
          <ol className="log">
            {actions.map((x, i) => <li key={i}><span className="sub">{x.at}</span> {x.text}</li>)}
            {!actions.length && <li className="sub">No actions yet</li>}
          </ol>
        </aside>
      </div>
    </section>
  );
}
