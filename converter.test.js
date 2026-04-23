import test from "node:test";
import assert from "node:assert/strict";

import { converters, format, getConversion } from "./converter.js";

test("length conversion stays accurate in metric to imperial mode", () => {
  const result = getConversion(converters.length, 1, "metricToImperial");

  assert.equal(result.inputUnit, "meters");
  assert.equal(result.outputUnit, "feet");
  assert.equal(result.outputValue, 3.28084);
});

test("temperature conversion supports imperial to metric input", () => {
  const result = getConversion(converters.temperature, 32, "imperialToMetric");

  assert.equal(result.inputUnit, "°F");
  assert.equal(result.outputUnit, "°C");
  assert.equal(result.outputValue, 0);
});

test("format rounds to two decimals", () => {
  assert.equal(format(3.456), "3.46");
  assert.equal(format(-6.6666), "-6.67");
});
