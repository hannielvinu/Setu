import { describe, it, expect } from "vitest";
import { parseRegisterCsv, REGISTER_COLUMNS } from "./csv.js";
const header = REGISTER_COLUMNS.join(",");
describe("six-field register CSV", () => {
  it("preserves quoted commas, escaped quotes and UTF-8 BOM headers", () => {
    const [row] = parseRegisterCsv('\uFEFF' + header + '\r\nAH-26-10001,"Demo, ""Patient""",9000000001,chemo_q21x6,1,2026-10-01');
    expect(row.fields.name).toBe('Demo, "Patient"');
    expect(row.status).toBe("pending");
  });
  it("rejects extra columns rather than accepting clinical fields", () => {
    expect(() => parseRegisterCsv(header + ',diagnosis\nx,x,x,x,x,x,x')).toThrow("exactly these six");
  });
  it("reports malformed quotations and duplicate identifiers", () => {
    expect(() => parseRegisterCsv(header + '\n"not closed')).toThrow("not closed");
    const row = '\nAH-26-10001,Demo,9000000001,chemo_q21x6,1,2026-10-01';
    expect(() => parseRegisterCsv(header + row + row)).toThrow("Duplicate");
  });
});
