import { describe, expect, it } from "vitest";
import { TypeOf } from "lib/types/checker.ts";

describe("TypeOf", () => {
  it("should correctly identify arrays", () => {
    expect(TypeOf.isArray([])).toBe(true);
    expect(TypeOf.isArray([1, 2, 3])).toBe(true);
    expect(TypeOf.isArray(new Array(3))).toBe(true);
    expect(TypeOf.isArray({})).toBe(false);
    expect(TypeOf.isArray(null)).toBe(false);
    expect(TypeOf.isArray(undefined)).toBe(false);
    expect(TypeOf.isArray("abc")).toBe(false);
  });

  it("should correctly identify plain objects", () => {
    expect(TypeOf.isObject({})).toBe(true);
    expect(TypeOf.isObject({ a: 1, b: 2 })).toBe(true);
    expect(TypeOf.isObject(new Object())).toBe(true);
    expect(TypeOf.isObject([])).toBe(false);
    expect(TypeOf.isObject(null)).toBe(false);
    expect(TypeOf.isObject(undefined)).toBe(false);
    expect(TypeOf.isObject("abc")).toBe(false);
    expect(TypeOf.isObject(new Date())).toBe(false);
    expect(TypeOf.isObject(new Error())).toBe(false);
    class MyClass {}
    expect(TypeOf.isObject(new MyClass())).toBe(false);
  });

  it("should correctly identify numbers", () => {
    expect(TypeOf.isNumber(0)).toBe(true);
    expect(TypeOf.isNumber(10)).toBe(true);
    expect(TypeOf.isNumber(-5)).toBe(true);
    expect(TypeOf.isNumber(3.14)).toBe(true);
    expect(TypeOf.isNumber(NaN)).toBe(false);
    expect(TypeOf.isNumber(Infinity)).toBe(true);
    expect(TypeOf.isNumber(-Infinity)).toBe(true);
    expect(TypeOf.isNumber("10")).toBe(false);
    expect(TypeOf.isNumber(null)).toBe(false);
    expect(TypeOf.isNumber(undefined)).toBe(false);
    expect(TypeOf.isNumber({})).toBe(false);
  });

  it("should correctly identify integers", () => {
    expect(TypeOf.isInt(0)).toBe(true);
    expect(TypeOf.isInt(10)).toBe(true);
    expect(TypeOf.isInt(-5)).toBe(true);
    expect(TypeOf.isInt(3.14)).toBe(false);
    expect(TypeOf.isInt(NaN)).toBe(false);
    expect(TypeOf.isInt(Infinity)).toBe(false);
    expect(TypeOf.isInt("10")).toBe(false);
    expect(TypeOf.isInt(null)).toBe(false);
    expect(TypeOf.isInt(undefined)).toBe(false);
    expect(TypeOf.isInt({})).toBe(false);
    expect(TypeOf.isInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(TypeOf.isInt(Number.MIN_SAFE_INTEGER)).toBe(true);
  });

  it("should correctly identify error objects", () => {
    expect(TypeOf.isError(new Error())).toBe(true);
    expect(TypeOf.isError(new TypeError())).toBe(true);
    expect(TypeOf.isError(new SyntaxError())).toBe(true);
    expect(TypeOf.isError({})).toBe(false);
    expect(TypeOf.isError(null)).toBe(false);
    expect(TypeOf.isError(undefined)).toBe(false);
    expect(TypeOf.isError("Error")).toBe(false);
  });

  it("should correctly identify strings", () => {
    expect(TypeOf.isString("")).toBe(true);
    expect(TypeOf.isString("abc")).toBe(true);
    expect(TypeOf.isString(new String("abc"))).toBe(true);
    expect(TypeOf.isString(123)).toBe(false);
    expect(TypeOf.isString(null)).toBe(false);
    expect(TypeOf.isString(undefined)).toBe(false);
    expect(TypeOf.isString({})).toBe(false);
  });

  it("should correctly identify booleans", () => {
    expect(TypeOf.isBoolean(true)).toBe(true);
    expect(TypeOf.isBoolean(false)).toBe(true);
    expect(TypeOf.isBoolean(new Boolean(true))).toBe(true);
    expect(TypeOf.isBoolean(0)).toBe(false);
    expect(TypeOf.isBoolean(1)).toBe(false);
    expect(TypeOf.isBoolean(null)).toBe(false);
    expect(TypeOf.isBoolean(undefined)).toBe(false);
    expect(TypeOf.isBoolean({})).toBe(false);
  });

  it("should correctly identify null", () => {
    expect(TypeOf.isNull(null)).toBe(true);
    expect(TypeOf.isNull(undefined)).toBe(false);
    expect(TypeOf.isNull(0)).toBe(false);
    expect(TypeOf.isNull("")).toBe(false);
    expect(TypeOf.isNull({})).toBe(false);
  });

  it("should correctly identify undefined", () => {
    expect(TypeOf.isUndefined(undefined)).toBe(true);
    expect(TypeOf.isUndefined(null)).toBe(false);
    expect(TypeOf.isUndefined(0)).toBe(false);
    expect(TypeOf.isUndefined("")).toBe(false);
    expect(TypeOf.isUndefined({})).toBe(false);
  });

  it("should correctly identify empty objects", () => {
    expect(TypeOf.isEmptyObject({})).toBe(true);
    expect(TypeOf.isEmptyObject({ a: 1 })).toBe(false);
    expect(TypeOf.isEmptyObject(new Object())).toBe(true);
    expect(TypeOf.isEmptyObject(null)).toBe(false);
    expect(TypeOf.isEmptyObject(undefined)).toBe(false);
    expect(TypeOf.isEmptyObject([])).toBe(false);
  });

  it("should correctly identify empty arrays", () => {
    expect(TypeOf.isEmptyArray([])).toBe(true);
    expect(TypeOf.isEmptyArray([1, 2, 3])).toBe(false);
    expect(TypeOf.isEmptyArray(new Array(0))).toBe(true);
    expect(TypeOf.isEmptyArray(null)).toBe(false);
    expect(TypeOf.isEmptyArray(undefined)).toBe(false);
    expect(TypeOf.isEmptyArray({})).toBe(false);
  });
});
