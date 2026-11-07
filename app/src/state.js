import { makePatients, makeSlots, makeRegisterRows, PATHWAYS_BY_ID } from "./data/demo.js";
import { DEFAULT_EMERGENCY_CARD } from "./engine/classifier.js";
import { rowToPatient } from "./engine/verify.js";

const KEY = "setu-demo-v2";
export const TODAY = new Date();

export function initialState() {
  return {
    patients: makePatients(TODAY),
    activity: [],
    slots: makeSlots(TODAY),
    registerRows: makeRegisterRows(TODAY).map((r) => ({ ...r, fields: { ...r.ocr }, confirmed: {}, status: "pending", source: "Register photo (OCR)" })),
    nurseQueue: [],
    calls: [],
    tiers: {},
    emergencyCard: DEFAULT_EMERGENCY_CARD,
    session: { barrierCounts: {}, funnel: { flagged: 0, headsUp: 0, reached: 0, verified: 0, barrierCaptured: 0, rebooked: 0 }, emergencies: 0, symptomNotes: 0 },
    selectedPatientId: null,
    verifiedSeq: 1,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.patients && s.savedOn === new Date().toDateString()) return s;
    }
  } catch {
    /* storage unavailable: start fresh */
  }
  return initialState();
}

export function saveState(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, savedOn: new Date().toDateString() }));
  } catch {
    /* ignore */
  }
}

const bump = (funnel, key, n = 1) => ({ ...funnel, [key]: (funnel[key] || 0) + n });

function reduceState(s, a) {
  switch (a.type) {
    case "RESET":
      return initialState();
    case "SELECT_PATIENT":
      return { ...s, selectedPatientId: a.id };
    case "SET_TIER":
      return { ...s, tiers: { ...s.tiers, [a.pathwayId]: { ...(s.tiers[a.pathwayId] || {}), [a.stepId]: a.tier } } };
    case "UPDATE_PATIENT":
      return { ...s, patients: s.patients.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };
    case "FUNNEL":
      return { ...s, session: { ...s.session, funnel: bump(s.session.funnel, a.key) } };
    case "BOOK_SLOT": {
      const patient = s.patients.find((p) => p.id === a.patientId);
      const slot = s.slots.find((x) => x.id === a.slotId && !x.taken);
      if (!patient || patient.status !== "open" || !patient.consent.call || !slot) return s;
      return {
        ...s,
        patients: s.patients.map((p) => p.id === patient.id ? { ...p, status: "rebooked", bookedSlotId: slot.id } : p),
        slots: s.slots.map((x) => x.id === slot.id ? { ...x, taken: true, patientId: patient.id } : x),
      };
    }
    case "CONFIRM_ATTENDANCE": {
      const patient = s.patients.find((p) => p.id === a.id && p.status === "rebooked" && p.bookedSlotId);
      const slot = patient && s.slots.find((x) => x.id === patient.bookedSlotId && x.patientId === patient.id);
      if (!slot) return s;
      const next = { ...patient, status: "returned", returnConfirmedAt: new Date().toISOString(), attendedVisitDate: slot.date };
      return { ...s, patients: s.patients.map((p) => p.id === patient.id ? next : p) };
    }
    case "NURSE_ADD": {
      const session = { ...s.session };
      if (a.item.type === "emergency") session.emergencies += 1;
      else session.symptomNotes += 1;
      return { ...s, session, nurseQueue: [{ ...a.item, id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), status: "open" }, ...s.nurseQueue] };
    }
    case "NURSE_RESOLVE":
      return { ...s, nurseQueue: s.nurseQueue.map((n) => (n.id === a.id ? { ...n, status: "done", resolution: a.resolution, resolvedAt: Date.now() } : n)) };
    case "LOG_CALL": {
      const counts = { ...s.session.barrierCounts };
      for (const b of a.call.barriers) counts[b] = (counts[b] || 0) + 1;
      let funnel = s.session.funnel;
      if (a.call.barriers.length) funnel = bump(funnel, "barrierCaptured");
      return { ...s, calls: [{ ...a.call, at: Date.now() }, ...s.calls], session: { ...s.session, barrierCounts: counts, funnel } };
    }
    case "EDIT_ROW":
      return { ...s, registerRows: s.registerRows.map((r) => (r.id === a.id ? { ...r, fields: { ...r.fields, [a.field]: a.value }, confirmed: { ...r.confirmed, [a.field]: true } } : r)) };
    case "CONFIRM_FIELD":
      return { ...s, registerRows: s.registerRows.map((r) => (r.id === a.id ? { ...r, confirmed: { ...r.confirmed, [a.field]: true } } : r)) };
    case "REJECT_ROW":
      return { ...s, registerRows: s.registerRows.map((r) => (r.id === a.id ? { ...r, status: "rejected" } : r)) };
    case "APPROVE_ROW": {
      const row = s.registerRows.find((r) => r.id === a.id);
      if (!row || row.status !== "pending") return s;
      const patient = rowToPatient(row.fields, PATHWAYS_BY_ID, TODAY, s.verifiedSeq);
      return {
        ...s,
        verifiedSeq: s.verifiedSeq + 1,
        patients: [...s.patients, patient],
        registerRows: s.registerRows.map((r) => (r.id === a.id ? { ...r, status: "approved", patientId: patient.id } : r)),
      };
    }
    case "IMPORT_ROWS":
      return { ...s, registerRows: [...a.rows, ...s.registerRows] };
    default:
      return s;
  }
}

export function reducer(s, a) {
  const next = reduceState(s, a);
  const tracked = ["UPDATE_PATIENT","SET_TIER","BOOK_SLOT","CONFIRM_ATTENDANCE","NURSE_ADD","NURSE_RESOLVE","LOG_CALL","APPROVE_ROW","REJECT_ROW","IMPORT_ROWS"];
  if (next === s || !tracked.includes(a.type)) return next;
  const patientId = a.patientId || a.item?.patientId || a.call?.patientId || a.id;
  const patient = next.patients.find(p => p.id === patientId);
  const at = new Date().toISOString();
  return {...next,activity:[...(s.activity || []),{id:at+"-"+Math.random().toString(36).slice(2,7),at,type:a.type,patientName:patient?.name || a.call?.name || a.item?.name || "",outcome:a.call?.outcome || a.resolution || ""}].slice(-500)};
}
