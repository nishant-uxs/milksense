export interface MilkSensorValues {
  density: number | null;
  tds: number | null;
  ph: number | null;
  turbidity: number | null;
  temperature: number | null;
}

export interface SensorConfig {
  density: boolean;
  tds: boolean;
  ph: boolean;
  turbidity: boolean;
  temperature: boolean;
}

export type SensorKey = keyof MilkSensorValues;

export interface MilkDatasetEntry {
  density: number;
  tds: number;
  ph: number;
  turbidity: number;
  temperature: number;
  label: MilkLabel;
}

export type MilkLabel =
  | "Pure Milk"
  | "Diluted Milk"
  | "Salt Contamination"
  | "Detergent Contamination";

export type IssueType =
  | "None"
  | "Dilution detected"
  | "Possible chemical contamination"
  | "Possible salt addition"
  | "Multiple anomalies detected";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type AppMode = "manual" | "sensor";

export interface AnalysisResult {
  qualityScore: number;
  possibleIssue: IssueType;
  estimatedDilution: number;
  confidence: ConfidenceLevel;
  matchedLabel: MilkLabel;
  sensorScores: {
    density: number;
    tds: number;
    ph: number;
    turbidity: number;
    temperature: number;
  };
  timestamp: number;
}

export interface SampleHistory {
  id: string;
  inputValues: MilkSensorValues;
  sensorConfig: SensorConfig;
  result: AnalysisResult;
  timestamp: number;
}

export const SENSOR_RANGES = {
  density: { min: 1.026, max: 1.032, unit: "g/ml", ideal: 1.030 },
  tds: { min: 250, max: 350, unit: "ppm", ideal: 300 },
  ph: { min: 6.6, max: 6.8, unit: "pH", ideal: 6.7 },
  turbidity: { min: 700, max: 900, unit: "NTU", ideal: 800 },
  temperature: { min: 2, max: 37, unit: "°C", ideal: 25 },
} as const;

export const SENSOR_LABELS: Record<SensorKey, string> = {
  density: "Density",
  tds: "TDS",
  ph: "pH",
  turbidity: "Turbidity",
  temperature: "Temperature",
};

export const SENSOR_ICONS: Record<SensorKey, string> = {
  density: "droplet",
  tds: "activity",
  ph: "thermometer",
  turbidity: "eye",
  temperature: "thermometer",
};
