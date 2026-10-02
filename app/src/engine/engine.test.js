import { describe, it, expect } from "vitest";
import { computePriority, assess, buildWorklist } from "./priority.js";
import { classify, matches } from "./classifier.js";
import { sanityIssues } from "./verify.js";
import { makePatients, PATHWAYS_BY_ID } from "../data/demo.js";
import { addDays, toISO } from "./dates.js";

const today = new Date(2026, 9, 3);

describe("operational priority", () => {
  it("is zero when not overdue", () => {
    expect(computePriority(0, 3, 2)).toBe(0);
  });
  it("scales with days overdue, clinician tier and past misses only", () => {
    expect(computePriority(9, 3, 1)).toBe(41); // 9 × 3 × 1.5 = 40.5
    expect(computePriority(9, 1, 0)).toBe(9);
  });
  it("applies the pathway grace period", () => {
    const shanti = makePatients(today)[0];
    const a = assess(shanti, PATHWAYS_BY_ID[shanti.pathwayId], today);
    expect(a.step.label).toBe("Chemotherapy cycle 4");
    expect(a.daysOverdue).toBe(9); // 12 days late − 3 grace days
  });
  it("respects clinician tier overrides", () => {
    const shanti = makePatients(today)[0];
    const p = PATHWAYS_BY_ID[shanti.pathwayId];
    const base = assess(shanti, p, today).priority;
    const lowered = assess(shanti, p, today, { chemo_q21x6: { c4: 1 } }).priority;
    expect(lowered).toBeLessThan(base);
  });
  it("sorts the worklist by priority", () => {
    const list = buildWorklist(makePatients(today), PATHWAYS_BY_ID, today);
    for (let i = 1; i < list.length; i++) expect(list[i - 1].a.priority).toBeGreaterThanOrEqual(list[i].a.priority);
  });
});

describe("reply classifier", () => {
  it("captures multiple non-clinical barriers", () => {
    const r = classify("My Ayushman card expired, and the bus fare is too much");
    expect(r.barriers).toEqual(expect.arrayContaining(["paperwork", "travel", "money"]));
    expect(r.emergency).toHaveLength(0);
  });
  it("works in Hindi", () => {
    const r = classify("बेटे को काम है, मुझे लाने वाला कोई नहीं है");
    expect(r.barriers).toContain("family");
  });
  it("routes emergency-card phrases to the emergency path", () => {
    expect(classify("I have had fever since yesterday").emergency.map((e) => e.id)).toContain("fever");
    expect(classify("कल से तेज़ बुखार है").emergency.map((e) => e.id)).toContain("fever");
  });
  it("does not treat a blood test as bleeding", () => {
    expect(classify("my blood test report is not ready").emergency).toHaveLength(0);
  });
  it("logs other symptoms for a nurse without classifying severity", () => {
    const r = classify("I feel very weak and tired");
    expect(r.emergency).toHaveLength(0);
    expect(r.symptoms.length).toBeGreaterThan(0);
  });
  it("distinguishes dar (fear) from dard (pain)", () => {
    expect(matches("bahut dard hai", "dar$")).toBe(false);
    expect(matches("mujhe dar lagta hai", "dar$")).toBe(true);
  });
});

describe("register sanity checks", () => {
  const ok = { regNo: "AH-24-10231", name: "Kamla Bai", phone: "9822014475", pathwayId: "chemo_q21x6", step: "2", date: toISO(addDays(today, -30)) };
  it("passes a clean row", () => {
    expect(sanityIssues(ok, today, PATHWAYS_BY_ID)).toHaveLength(0);
  });
  it("blocks future dates, short phones and unreadable names", () => {
    expect(sanityIssues({ ...ok, date: toISO(addDays(today, 30)) }, today, PATHWAYS_BY_ID)[0].field).toBe("date");
    expect(sanityIssues({ ...ok, phone: "976530128" }, today, PATHWAYS_BY_ID)[0].field).toBe("phone");
    expect(sanityIssues({ ...ok, name: "Ravi Th?rat" }, today, PATHWAYS_BY_ID)[0].field).toBe("name");
  });
});
