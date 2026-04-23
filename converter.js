// --- Conversion Registry ----------------------------------

function linearUnit(label, symbol, system, factorToBase) {
    return {
        label,
        symbol,
        system,
        toBase: (value) => value * factorToBase,
        fromBase: (value) => value / factorToBase
    };
}

export const converters = {
    length: {
        label: "Length",
        category: "Everyday",
        baseUnit: "meter",
        defaultFrom: "meter",
        defaultTo: "foot",
        units: {
            meter: linearUnit("meter", "m", "SI", 1),
            centimeter: linearUnit("centimeter", "cm", "Metric", 0.01),
            kilometer: linearUnit("kilometer", "km", "Metric", 1000),
            inch: linearUnit("inch", "in", "Imperial", 0.0254),
            foot: linearUnit("foot", "ft", "Imperial", 0.3048),
            yard: linearUnit("yard", "yd", "Imperial", 0.9144)
        }
    },

    volume: {
        label: "Volume",
        category: "Everyday",
        baseUnit: "liter",
        defaultFrom: "liter",
        defaultTo: "gallon",
        units: {
            liter: linearUnit("liter", "L", "Metric", 1),
            milliliter: linearUnit("milliliter", "mL", "Metric", 0.001),
            cubicMeter: linearUnit("cubic meter", "m3", "SI", 1000),
            gallon: linearUnit("gallon", "gal", "US customary", 3.785411784),
            cup: linearUnit("cup", "cup", "US customary", 0.2365882365)
        }
    },

    mass: {
        label: "Mass",
        category: "Everyday",
        baseUnit: "kilogram",
        defaultFrom: "kilogram",
        defaultTo: "pound",
        units: {
            kilogram: linearUnit("kilogram", "kg", "SI", 1),
            gram: linearUnit("gram", "g", "Metric", 0.001),
            tonne: linearUnit("tonne", "t", "Metric", 1000),
            pound: linearUnit("pound", "lb", "Imperial", 0.45359237),
            ounce: linearUnit("ounce", "oz", "Imperial", 0.028349523125)
        }
    },

    temperature: {
        label: "Temperature",
        category: "Everyday",
        baseUnit: "kelvin",
        defaultFrom: "celsius",
        defaultTo: "fahrenheit",
        units: {
            kelvin: {
                label: "kelvin",
                symbol: "K",
                system: "SI",
                toBase: (value) => value,
                fromBase: (value) => value
            },
            celsius: {
                label: "celsius",
                symbol: "°C",
                system: "Metric",
                toBase: (value) => value + 273.15,
                fromBase: (value) => value - 273.15
            },
            fahrenheit: {
                label: "fahrenheit",
                symbol: "°F",
                system: "Imperial",
                toBase: (value) => ((value - 32) * 5 / 9) + 273.15,
                fromBase: (value) => ((value - 273.15) * 9 / 5) + 32
            }
        }
    },

    speed: {
        label: "Speed",
        category: "Motion",
        baseUnit: "meterPerSecond",
        defaultFrom: "meterPerSecond",
        defaultTo: "milePerHour",
        units: {
            meterPerSecond: linearUnit("meter per second", "m/s", "SI", 1),
            kilometerPerHour: linearUnit("kilometer per hour", "km/h", "Metric", 0.2777777778),
            milePerHour: linearUnit("mile per hour", "mph", "Imperial", 0.44704),
            knot: linearUnit("knot", "kn", "Nautical", 0.5144444444)
        }
    },

    pressure: {
        label: "Pressure",
        category: "Physics",
        baseUnit: "pascal",
        defaultFrom: "kilopascal",
        defaultTo: "psi",
        units: {
            pascal: linearUnit("pascal", "Pa", "SI", 1),
            kilopascal: linearUnit("kilopascal", "kPa", "Metric", 1000),
            bar: linearUnit("bar", "bar", "Metric", 100000),
            psi: linearUnit("pound-force per square inch", "psi", "Imperial", 6894.757293168),
            atmosphere: linearUnit("standard atmosphere", "atm", "Scientific", 101325)
        }
    },

    energy: {
        label: "Energy",
        category: "Physics",
        baseUnit: "joule",
        defaultFrom: "joule",
        defaultTo: "btu",
        units: {
            joule: linearUnit("joule", "J", "SI", 1),
            kilojoule: linearUnit("kilojoule", "kJ", "Metric", 1000),
            calorie: linearUnit("calorie", "cal", "Metric", 4.184),
            btu: linearUnit("British thermal unit", "BTU", "Imperial", 1055.05585262)
        }
    },

    force: {
        label: "Force",
        category: "Physics",
        baseUnit: "newton",
        defaultFrom: "newton",
        defaultTo: "poundForce",
        units: {
            newton: linearUnit("newton", "N", "SI", 1),
            kilonewton: linearUnit("kilonewton", "kN", "Metric", 1000),
            poundForce: linearUnit("pound-force", "lbf", "Imperial", 4.4482216152605),
            dyne: linearUnit("dyne", "dyn", "CGS", 0.00001)
        }
    }
};

// --- Helpers ----------------------------------------------

export function getUnitOptions(cfg) {
    return Object.entries(cfg.units).map(([id, unit]) => ({
        id,
        label: `${unit.label} (${unit.symbol})`,
        system: unit.system,
        symbol: unit.symbol
    }));
}

export function getConversion(cfg, value, fromUnitId = cfg.defaultFrom, toUnitId = cfg.defaultTo) {
    const fromUnit = cfg.units[fromUnitId];
    const toUnit = cfg.units[toUnitId];
    const baseValue = fromUnit.toBase(value);

    return {
        fromUnitId,
        toUnitId,
        inputUnit: fromUnit.symbol,
        outputUnit: toUnit.symbol,
        inputLabel: fromUnit.label,
        outputLabel: toUnit.label,
        fromSystem: fromUnit.system,
        toSystem: toUnit.system,
        inputValue: value,
        outputValue: toUnit.fromBase(baseValue)
    };
}

export function format(n) {
    return Number(n).toFixed(2);
}
