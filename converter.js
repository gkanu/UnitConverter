// --- Conversion Registry ----------------------------------

export const converters = {
    length: {
        label: "Length",
        units: ["meters", "feet"],
        convert: (value) => ({
            metricToImperial: value * 3.28084,
            imperialToMetric: value / 3.28084
        })
    },

    volume: {
        label: "Volume",
        units: ["liters", "gallons"],
        convert: (value) => ({
            metricToImperial: value * 0.264172,
            imperialToMetric: value / 0.264172
        })
    },

    mass: {
        label: "Mass",
        units: ["kg", "lb"],
        convert: (value) => ({
            metricToImperial: value * 2.20462,
            imperialToMetric: value / 2.20462
        })
    },

    temperature: {
        label: "Temperature",
        units: ["°C", "°F"],
        convert: (value) => ({
            metricToImperial: (value * 9 / 5) + 32,
            imperialToMetric: (value - 32) * 5 / 9
        })
    },

    speed: {
        label: "Speed",
        units: ["km/h", "mph"],
        convert: (value) => ({
            metricToImperial: value * 0.621371,
            imperialToMetric: value / 0.621371
        })
    },

    pressure: {
        label: "Pressure",
        units: ["kPa", "psi"],
        convert: (v) => ({
            metricToImperial: v * 0.145038,
            imperialToMetric: v / 0.145038
        })
    },

    energy: {
        label: "Energy",
        units: ["J", "BTU"],
        convert: (v) => ({
            metricToImperial: v * 0.000947817,
            imperialToMetric: v / 0.000947817
        })
    },

    force: {
        label: "Force",
        units: ["N", "lbf"],
        convert: (v) => ({
            metricToImperial: v * 0.224809,
            imperialToMetric: v / 0.224809
        })
    }


};

// --- Helpers ----------------------------------------------

export function format(n) {
    return Number(n).toFixed(2);
}
