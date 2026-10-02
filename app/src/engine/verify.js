import { daysBetween, fromISO, toISO, addDays } from "./dates.js";

/**
 * The only six fields Setu ever digitises from a register or export.
 * No drug names, doses, diagnoses or clinical values are extracted.
 */
export const FIELDS = [
  { key: "regNo", label: "Reg. no." },
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "pathwayId", label: "Pathway" },
  { key: "step", label: "Visit / cycle no." },
  { key: "date", label: "Last visit date" },
];

export const LOW_CONFIDENCE = 0.8;

/** Deterministic sanity checks. Any failure blocks approval until a person fixes it. */
export function sanityIssues(row, today, pathwaysById) {
  const issues = [];
  if (!/^AH-\d{2}-\d{5}$/.test(row.regNo || "")) issues.push({ field: "regNo", msg: "Registration number format looks wrong" });
  if (!row.name || /[?#*]/.test(row.name)) issues.push({ field: "name", msg: "Name has unreadable characters" });
  if (!/^[6-9]\d{9}$/.test(row.phone || "")) issues.push({ field: "phone", msg: "Not a valid 10-digit Indian mobile number" });
  const pathway = pathwaysById[row.pathwayId];
  if (!pathway) issues.push({ field: "pathwayId", msg: "Unknown pathway" });
  const step = Number(row.step);
  if (!Number.isInteger(step) || step < 1 || (pathway && step > pathway.steps.length)) {
    issues.push({ field: "step", msg: "Visit number outside this pathway" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date || "")) {
    issues.push({ field: "date", msg: "Date missing or unreadable" });
  } else {
    const age = daysBetween(fromISO(row.date), today);
    if (age < 0) issues.push({ field: "date", msg: "Visit date is in the future" });
    else if (age > 730) issues.push({ field: "date", msg: "Visit date is more than 2 years ago" });
  }
  return issues;
}

/** Turn an approved register row into a patient record on the pathway. */
export function rowToPatient(row, pathwaysById, today, idx) {
  const pathway = pathwaysById[row.pathwayId];
  const completed = Number(row.step);
  const lastStep = pathway.steps[completed - 1];
  const start = addDays(fromISO(row.date), -lastStep.dayOffset);
  const t = new Date(today);
  return {
    id: `v${idx}`,
    regNo: row.regNo,
    name: row.name,
    firstName: row.name.split(" ")[0],
    age: null,
    sex: "",
    birthYear: null,
    phone: row.phone.slice(0, 2) + "XXXXXX" + row.phone.slice(-2),
    language: "hi",
    distanceKm: null,
    pathwayId: row.pathwayId,
    startDate: toISO(start),
    completedSteps: completed,
    pastMisses: 0,
    caregivers: [],
    consent: { call: true, whatsapp: true, sms: true, sender: "neutral" },
    status: "open",
    source: `Register row verified ${t.toLocaleDateString("en-IN")}`,
  };
}
