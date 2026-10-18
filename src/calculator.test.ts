import { describe, expect, it } from "vitest";
import { calculateGas, parseWeight } from "./calculator";
describe("calculateGas", () => {
  it.each([5, 8, 11, 3.5])("calculates half a %s kg bottle", (capacity) => {
    expect(
      calculateGas({ capacity, tare: 10, total: 10 + capacity / 2 }),
    ).toEqual({ ok: true, remaining: capacity / 2, percentage: 50 });
  });
  it("handles an empty bottle", () =>
    expect(calculateGas({ capacity: 11, tare: 10, total: 10 })).toEqual({
      ok: true,
      remaining: 0,
      percentage: 0,
    }));
  it("handles a full bottle", () =>
    expect(calculateGas({ capacity: 11, tare: 10, total: 21 })).toEqual({
      ok: true,
      remaining: 11,
      percentage: 100,
    }));
  it.each([
    { capacity: 0, tare: 10, total: 15 },
    { capacity: -5, tare: 10, total: 15 },
    { capacity: 11, tare: -1, total: 5 },
    { capacity: 11, tare: 1, total: -5 },
    { capacity: 11, tare: 10, total: 9 },
    { capacity: 11, tare: 10, total: 22 },
    { capacity: NaN, tare: 10, total: 15 },
    { capacity: 11, tare: Infinity, total: 15 },
    { capacity: 11, tare: 10, total: NaN },
  ])("rejects invalid weights: %j", (input) =>
    expect(calculateGas(input).ok).toBe(false),
  );
  it("does not round before calculating", () => {
    const result = calculateGas({ capacity: 11, tare: 10.5, total: 17.8 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.remaining).toBeCloseTo(7.3);
      expect(result.percentage).toBeCloseTo(66.363636);
    }
  });
  it("tolerates floating point noise at full capacity", () =>
    expect(calculateGas({ capacity: 0.2, tare: 0.1, total: 0.3 }).ok).toBe(
      true,
    ));
});
describe("parseWeight", () => {
  it.each([
    ["10,5", 10.5],
    [" 10.5 ", 10.5],
    ["0", 0],
    ["-2", -2],
  ])("parses %s", (value, expected) =>
    expect(parseWeight(value)).toBe(expected),
  );
  it.each(["", " ", "1,2,3", "abc", "12kg", "Infinity", "0x10"])(
    "rejects %s",
    (value) => expect(parseWeight(value)).toBeNaN(),
  );
});
