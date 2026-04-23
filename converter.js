// --- Conversion Registry ----------------------------------

export const converters = {
    length: {
        label: "Length",
        category: "Everyday",
        units: ["meters", "feet"],
        convert: (value) => ({
            metricToImperial: value * 3.28084,
            imperialToMetric: value / 3.28084
        })
    },

    volume: {
        label: "Volume",
        category: "Everyday",
        units: ["liters", "gallons"],
        convert: (value) => ({
            metricToImperial: value * 0.264172,
            imperialToMetric: value / 0.264172
        })
    },

    mass: {
        label: "Mass",
        category: "Everyday",
        units: ["kg", "lb"],
        convert: (value) => ({
            metricToImperial: value * 2.20462,
            imperialToMetric: value / 2.20462
        })
    },

    temperature: {
        label: "Temperature",
        category: "Everyday",
        units: ["°C", "°F"],
        convert: (value) => ({
            metricToImperial: (value * 9 / 5) + 32,
            imperialToMetric: (value - 32) * 5 / 9
        })
    },

    speed: {
        label: "Speed",
        category: "Motion",
        units: ["km/h", "mph"],
        convert: (value) => ({
            metricToImperial: value * 0.621371,
            imperialToMetric: value / 0.621371
        })
    },

    pressure: {
        label: "Pressure",
        category: "Physics",
        units: ["kPa", "psi"],
        convert: (v) => ({
            metricToImperial: v * 0.145038,
            imperialToMetric: v / 0.145038
        })
    },

    energy: {
        label: "Energy",
        category: "Physics",
        units: ["J", "BTU"],
        convert: (v) => ({
            metricToImperial: v * 0.000947817,
            imperialToMetric: v / 0.000947817
        })
    },

    force: {
        label: "Force",
        category: "Physics",
        units: ["N", "lbf"],
        convert: (v) => ({
            metricToImperial: v * 0.224809,
            imperialToMetric: v / 0.224809
        })
    }


};

// --- Helpers ----------------------------------------------

export function getConversion(cfg, value, direction = "metricToImperial") {
    const result = cfg.convert(value);
    const isMetricToImperial = direction === "metricToImperial";

    return {
        direction,
        inputUnit: isMetricToImperial ? cfg.units[0] : cfg.units[1],
        outputUnit: isMetricToImperial ? cfg.units[1] : cfg.units[0],
        inputValue: value,
        outputValue: isMetricToImperial ? result.metricToImperial : result.imperialToMetric
    };
}

export function format(n) {
    return Number(n).toFixed(2);
}
