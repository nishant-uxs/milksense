import type {
  AnalysisResult,
  ConfidenceLevel,
  IssueType,
  MilkSensorValues,
  SensorConfig,
} from "@/models/milk_sample";
import { SENSOR_RANGES } from "@/models/milk_sample";
import { findClosestEntry, labelToIssue } from "./dataset_engine";

const PURE_DENSITY = 1.030;
const WATER_DENSITY = 1.000;

export function calculateDilution(density: number): number {
  const dilution = ((PURE_DENSITY - density) / (PURE_DENSITY - WATER_DENSITY)) * 100;
  return Math.max(0, Math.min(100, parseFloat(dilution.toFixed(1))));
}

function scoreSensor(
  value: number,
  min: number,
  max: number,
  ideal: number
): number {
  if (value >= min && value <= max) {
    const range = max - min;
    const deviation = Math.abs(value - ideal);
    return Math.max(80, 100 - (deviation / (range / 2)) * 20);
  }

  const overMin = Math.abs(value - min);
  const overMax = Math.abs(value - max);
  const range = max - min;
  const excess = Math.min(overMin, overMax);

  const penalty = (excess / range) * 80;
  return Math.max(0, 80 - penalty);
}

function getConfidence(
  distance: number,
  activeCount: number
): ConfidenceLevel {
  if (activeCount >= 4 && distance < 5) return "High";
  if (activeCount >= 3 && distance < 20) return "Medium";
  if (activeCount >= 2 && distance < 50) return "Medium";
  return "Low";
}

export function analyzeMilkSample(
  values: MilkSensorValues,
  config: SensorConfig
): AnalysisResult {
  const activeValues = {
    density: config.density ? values.density : null,
    tds: config.tds ? values.tds : null,
    ph: config.ph ? values.ph : null,
    turbidity: config.turbidity ? values.turbidity : null,
    temperature: config.temperature ? values.temperature : null,
  };

  const sensorScores = {
    density: 100,
    tds: 100,
    ph: 100,
    turbidity: 100,
    temperature: 100,
  };

  let totalScore = 0;
  let activeCount = 0;

  const keys: (keyof MilkSensorValues)[] = [
    "density",
    "tds",
    "ph",
    "turbidity",
    "temperature",
  ];

  for (const key of keys) {
    const val = activeValues[key];
    if (val !== null) {
      const range = SENSOR_RANGES[key];
      const score = scoreSensor(val, range.min, range.max, range.ideal);
      sensorScores[key] = Math.round(score);
      totalScore += score;
      activeCount++;
    }
  }

  const qualityScore =
    activeCount > 0 ? Math.round(totalScore / activeCount) : 0;

  const { entry, distance } = findClosestEntry(
    activeValues.density,
    activeValues.tds,
    activeValues.ph,
    activeValues.turbidity,
    activeValues.temperature
  );

  const possibleIssue = labelToIssue(entry.label) as IssueType;
  const confidence = getConfidence(distance, activeCount);

  const estimatedDilution =
    activeValues.density !== null
      ? calculateDilution(activeValues.density)
      : 0;

  return {
    qualityScore,
    possibleIssue,
    estimatedDilution,
    confidence,
    matchedLabel: entry.label,
    sensorScores,
    timestamp: Date.now(),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#EF4444";
  return "#7F1D1D";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Acceptable";
  if (score >= 40) return "Poor";
  return "Unsafe";
}

export function getIssueColor(issue: IssueType): string {
  if (issue === "None") return "#22C55E";
  if (issue === "Dilution detected") return "#F59E0B";
  return "#EF4444";
}

export function getConfidenceColor(confidence: ConfidenceLevel): string {
  if (confidence === "High") return "#22C55E";
  if (confidence === "Medium") return "#F59E0B";
  return "#EF4444";
}
