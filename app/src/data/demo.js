/**
 * SYNTHETIC DEMO DATA. Every name, number and record here is fictional and
 * generated relative to today's date so the demo always looks current.
 */
import pathwaysDoc from "./pathways.json";
import { addDays, toISO, startOfDay } from "../engine/dates.js";

export const PATHWAYS = pathwaysDoc.pathways;
export const PATHWAYS_BY_ID = Object.fromEntries(PATHWAYS.map((p) => [p.id, p]));

// [name, age, sex, pathwayId, completedSteps, daysLate (vs due date), pastMisses, distanceKm, lang, caregiver]
const ROSTER = [
  ["Shanti Devi", 52, "F", "chemo_q21x6", 3, 12, 1, 140, "hi", ["Raju", "son"]],
  ["Ramesh Patil", 61, "M", "rt_course", 3, 6, 0, 85, "hi", ["Sunanda", "wife"]],
  ["Lakshmi Narayanan", 47, "F", "chemo_q21x6", 1, 18, 0, 210, "en", ["Arun", "husband"]],
  ["Mohammed Irfan", 39, "M", "chemo_q21x6", 4, 9, 2, 60, "hi", ["Ayesha", "wife"]],
  ["Sunita Yadav", 55, "F", "surveillance", 1, 24, 1, 320, "hi", ["Pooja", "daughter"]],
  ["Anil Kumar", 66, "M", "rt_course", 5, 4, 0, 35, "hi", ["Vikas", "son"]],
  ["Fatima Shaikh", 44, "F", "chemo_q21x6", 2, 7, 0, 120, "hi", ["Salim", "brother"]],
  ["Rekha Pawar", 58, "F", "surveillance", 0, 25, 0, 95, "hi", ["Nitin", "son"]],
  ["Gopal Rao", 63, "M", "chemo_q21x6", 5, 5, 1, 180, "en", ["Padma", "wife"]],
  ["Meena Kumari", 49, "F", "chemo_q21x6", 3, 2, 0, 15, "hi", ["Rohit", "son"]],
  ["Suresh Gaikwad", 57, "M", "surveillance", 2, 30, 2, 260, "hi", ["Kavita", "wife"]],
  ["Kavita Joshi", 42, "F", "rt_course", 2, 3, 0, 22, "en", ["Manoj", "husband"]],
  ["Rajesh Verma", 51, "M", "chemo_q21x6", 2, 9, 1, 150, "hi", ["Neha", "daughter"]],
  ["Asha Bhosale", 60, "F", "surveillance", 3, 10, 0, 45, "hi", ["Sachin", "son"]],
  ["Prakash Jadhav", 68, "M", "chemo_q21x6", 1, 1, 0, 12, "hi", ["Lata", "wife"]],
  ["Savitri Bai", 64, "F", "rt_course", 4, 8, 1, 175, "hi", ["Ganesh", "son"]],
  ["Imran Khan", 36, "M", "surveillance", 1, -5, 0, 55, "hi", ["Sana", "wife"]],
  ["Geeta Singh", 53, "F", "chemo_q21x6", 4, -3, 0, 70, "hi", ["Amit", "son"]],
  ["Priya Deshmukh", 29, "F", "mch_hrp", 3, 8, 1, 65, "hi", ["Sagar", "husband"]],
  ["Nirmala Das", 59, "F", "chemo_q21x6", 0, -2, 0, 40, "en", ["Bimal", "husband"]],
];

function regNo(i) {
  return `AH-24-${String(10111 + i * 37).padStart(5, "0")}`;
}

function maskedPhone(i) {
  return `98${(i * 7) % 10}XXXXX${String(10 + ((i * 13) % 89)).padStart(2, "0")}`;
}

export function makePatients(today = new Date()) {
  const t = startOfDay(today);
  return ROSTER.map(([name, age, sex, pathwayId, completedSteps, daysLate, pastMisses, distanceKm, lang, [cgName, cgRel]], i) => {
    const pathway = PATHWAYS_BY_ID[pathwayId];
    const step = pathway.steps[completedSteps];
    const start = addDays(t, -(step.dayOffset + daysLate));
    return {
      id: `p${i + 1}`,
      regNo: regNo(i),
      name,
      firstName: name.split(" ")[0],
      age,
      sex,
      birthYear: t.getFullYear() - age,
      phone: maskedPhone(i),
      language: lang,
      distanceKm,
      pathwayId,
      startDate: toISO(start),
      completedSteps,
      pastMisses,
      caregivers: [{ name: cgName, relation: cgRel }],
      consent: { call: true, whatsapp: i % 5 !== 3, sms: true, sender: "neutral" },
      status: "open",
      source: "Hospital appointment export",
    };
  });
}

/** Vacant / cancelled day-care slots over the next working days. */
export function makeSlots(today = new Date()) {
  const slots = [];
  const times = ["09:30", "11:00", "14:30"];
  let d = startOfDay(today);
  let n = 0;
  while (slots.length < 9) {
    d = addDays(d, 1);
    if (d.getDay() === 0) continue;
    const t = times[n % times.length];
    slots.push({ id: `s${slots.length + 1}`, date: toISO(d), time: t, chair: `Day-care chair ${1 + ((n * 3) % 8)}`, reason: n % 2 ? "Cancellation" : "Vacant", taken: false });
    n += 1;
  }
  return slots;
}

/**
 * Handwritten day-care register rows as an OCR engine might digitise them.
 * `written` = what is on paper; `ocr` = what the model extracted; `conf` = per-field confidence.
 * Row 3 has a misread month (future date), row 2 a dropped phone digit,
 * row 4 a low-confidence name. The clerk must fix these before approval.
 */
export function makeRegisterRows(today = new Date()) {
  const t = startOfDay(today);
  const d = (n) => addDays(t, -n);
  const fmt = (x) => `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${String(x.getFullYear()).slice(2)}`;
  const future = addDays(t, 35);
  return [
    { id: "r1", written: { regNo: "AH-24-10231", name: "Kamla Bai", phone: "9822014475", pathwayId: "chemo_q21x6", step: "2", date: fmt(d(30)) },
      ocr: { regNo: "AH-24-10231", name: "Kamla Bai", phone: "9822014475", pathwayId: "chemo_q21x6", step: "2", date: toISO(d(30)) },
      conf: { regNo: 0.97, name: 0.95, phone: 0.96, pathwayId: 0.99, step: 0.93, date: 0.94 } },
    { id: "r2", written: { regNo: "AH-24-10388", name: "Sunil Shinde", phone: "9765301128", pathwayId: "chemo_q21x6", step: "3", date: fmt(d(27)) },
      ocr: { regNo: "AH-24-10388", name: "Sunil Shinde", phone: "976530128", pathwayId: "chemo_q21x6", step: "3", date: toISO(d(27)) },
      conf: { regNo: 0.96, name: 0.94, phone: 0.71, pathwayId: 0.99, step: 0.92, date: 0.9 } },
    { id: "r3", written: { regNo: "AH-24-10412", name: "Parvati Kale", phone: "9890442317", pathwayId: "chemo_q21x6", step: "4", date: fmt(d(26)) },
      ocr: { regNo: "AH-24-10412", name: "Parvati Kale", phone: "9890442317", pathwayId: "chemo_q21x6", step: "4", date: toISO(future) },
      conf: { regNo: 0.95, name: 0.93, phone: 0.95, pathwayId: 0.99, step: 0.9, date: 0.58 } },
    { id: "r4", written: { regNo: "AH-24-10457", name: "Ravi Thorat", phone: "9923117704", pathwayId: "rt_course", step: "3", date: fmt(d(12)) },
      ocr: { regNo: "AH-24-10457", name: "Ravi Th?rat", phone: "9923117704", pathwayId: "rt_course", step: "3", date: toISO(d(12)) },
      conf: { regNo: 0.94, name: 0.62, phone: 0.93, pathwayId: 0.97, step: 0.91, date: 0.92 } },
    { id: "r5", written: { regNo: "AH-24-10490", name: "Usha Mane", phone: "9834560092", pathwayId: "chemo_q21x6", step: "1", date: fmt(d(29)) },
      ocr: { regNo: "AH-24-10490", name: "Usha Mane", phone: "9834560092", pathwayId: "chemo_q21x6", step: "1", date: toISO(d(29)) },
      conf: { regNo: 0.98, name: 0.96, phone: 0.97, pathwayId: 0.99, step: 0.95, date: 0.96 } },
  ];
}

/** Synthetic 30-day history so the dashboard has a baseline before the live demo adds to it. */
export const HISTORY = {
  barrierCounts: { money: 14, paperwork: 21, travel: 17, lodging: 6, family: 11, felt_better: 9, fear: 7, unaware: 8, other: 4 },
  funnel: { flagged: 128, headsUp: 121, reached: 97, verified: 89, barrierCaptured: 84, rebooked: 63, returned: 51 },
  nurse: { emergencies: 3, symptomNotes: 19, medianReviewSec: 34 },
};

export const LEAFLETS = [
  "Managing tiredness during treatment (hospital leaflet)",
  "Eating well during chemotherapy (hospital leaflet)",
  "Your day-care visit: what to bring (hospital leaflet)",
  "Emergency card: when to come to the hospital (hospital leaflet)",
];
