import test from "node:test";
import assert from "node:assert/strict";

import { converters, format, getConversion, getUnitOptions } from "./converter.js";

test("length conversion supports SI to imperial selections", () => {
  const result = getConversion(converters.length, 1, "meter", "inch");

  assert.equal(result.inputUnit, "m");
  assert.equal(result.outputUnit, "in");
  assert.equal(result.outputValue, 39.37007874015748);
});

test("temperature conversion supports kelvin to fahrenheit", () => {
  const result = getConversion(converters.temperature, 273.15, "kelvin", "fahrenheit");

  assert.equal(result.inputUnit, "K");
  assert.equal(result.outputUnit, "°F");
  assert.equal(result.outputValue, 32);
});

test("unit options expose system metadata for selectors", () => {
  const options = getUnitOptions(converters.pressure);

  assert.equal(options.some((option) => option.system === "SI" && option.id === "pascal"), true);
  assert.equal(options.some((option) => option.system === "Imperial" && option.id === "psi"), true);
});

test("format rounds to two decimals", () => {
  assert.equal(format(3.456), "3.46");
  assert.equal(format(-6.6666), "-6.67");
});
