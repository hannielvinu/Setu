import { addDays, daysBetween, fromISO } from "./dates.js";

/**
 * Operational follow-up priority.
 *
 * This is deliberately NOT a clinical risk score: it uses only schedule facts
 * (how many days a planned visit is overdue, how many visits were missed before)
 * and the follow-up tier that the clinician assigned to the pathway step.
 * No diagnosis, lab value or clinical data is read or inferred.
 *
 *   priority = daysOverdue × tier × (1 + 0.5 × pastMisses)
 */
export function computePriority(daysOverdue, tier, pastMisses) {
  if (daysOverdue <= 0) return 0;
  return Math.round(daysOverdue * tier * (1 + 0.5 * pastMisses));
}

export function stepTier(pathway, step, tierOverrides = {}) {
  return tierOverrides[pathway.id]?.[step.id] ?? step.tier;
}

/**
 * Where is this patient on their pathway today?
 * Returns null when the pathway is complete.
 */
export function assess(patient, pathway, today, tierOverrides = {}) {
  const step = pathway.steps[patient.completedSteps];
  if (!step) return null;
  const due = addDays(fromISO(patient.startDate), step.dayOffset);
  const late = daysBetween(due, today);
  const daysOverdue = Math.max(0, late - pathway.graceDays);
  const tier = stepTier(pathway, step, tierOverrides);
  return {
    step,
    stepNumber: patient.completedSteps + 1,
    totalSteps: pathway.steps.length,
    due,
    daysOverdue,
    overdue: daysOverdue > 0,
    tier,
    priority: computePriority(daysOverdue, tier, patient.pastMisses),
  };
}

/** Overdue patients, highest operational priority first. */
export function buildWorklist(patients, pathwaysById, today, tierOverrides = {}) {
  return patients
    .map((p) => ({ patient: p, a: assess(p, pathwaysById[p.pathwayId], today, tierOverrides) }))
    .filter((r) => r.a)
    .sort((x, y) => y.a.priority - x.a.priority || y.a.daysOverdue - x.a.daysOverdue);
}
