import { describe, it, expect } from "vitest";
import { initialState, reducer, TODAY } from "./state.js";
import { rowToPatient } from "./engine/verify.js";
import { PATHWAYS_BY_ID } from "./data/demo.js";

describe("closing the follow-up loop", () => {
  it("requires a booking before attendance can be recorded and keeps the events separate", () => {
    const s = initialState();
    const patientId = s.patients[0].id;
    const slotId = s.slots[0].id;
    expect(reducer(s, { type: "CONFIRM_ATTENDANCE", id: patientId })).toBe(s);
    const booked = reducer(s, { type: "BOOK_SLOT", patientId, slotId });
    expect(booked.patients[0].status).toBe("rebooked");
    expect(booked.patients[0].returnConfirmedAt).toBeUndefined();
    expect(reducer(booked, { type: "BOOK_SLOT", patientId: s.patients[1].id, slotId })).toBe(booked);
    const returned = reducer(booked, { type: "CONFIRM_ATTENDANCE", id: patientId });
    expect(returned.patients[0]).toMatchObject({ status: "returned", attendedVisitDate: s.slots[0].date });
    expect(reducer(returned, { type: "CONFIRM_ATTENDANCE", id: patientId })).toBe(returned);
  });

  it("does not infer consent from register approval or permit booking the imported record", () => {
    const s = initialState();
    const patient = rowToPatient(s.registerRows[0].fields, PATHWAYS_BY_ID, TODAY, 1);
    const imported = { ...s, patients: [patient] };
    expect(patient.consent).toMatchObject({ call: false, whatsapp: false, sms: false });
    expect(reducer(imported, { type: "BOOK_SLOT", patientId: patient.id, slotId: s.slots[0].id })).toBe(imported);
  });
});
