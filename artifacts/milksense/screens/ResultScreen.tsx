import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import MetricBar from "@/components/MetricBar";
import ResultCard from "@/components/ResultCard";
import ScoreGauge from "@/components/ScoreGauge";
import { useAnalysis } from "@/context/AnalysisContext";
import type { AnalysisResult, SensorConfig, MilkSensorValues, IssueType } from "@/models/milk_sample";
import { SENSOR_RANGES } from "@/models/milk_sample";
import { getScoreColor } from "@/services/milk_analysis";

const C = Colors.light;

const METRIC_COLORS: Record<string, string> = {
  density: C.tint,
  tds: C.accent,
  ph: "#A78BFA",
  turbidity: "#FB923C",
  temperature: "#F87171",
};

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const { lastResult, inputValues, sensorConfig } = useAnalysis();

  if (!lastResult) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No analysis available</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const scoreColor = getScoreColor(lastResult.qualityScore);
  const activeSensorCount = Object.values(sensorConfig).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
      >
        <Pressable
          style={styles.backIcon}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: scoreColor + "22", borderColor: scoreColor + "44" },
          ]}
        >
          <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>
            {lastResult.qualityScore}/100
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Gauge */}
        <View style={styles.gaugeSection}>
          <ScoreGauge score={lastResult.qualityScore} size={160} />
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeTitle}>Milk Quality Score</Text>
            <Text style={styles.gaugeSubtitle}>
              Based on {activeSensorCount} active sensors
            </Text>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.section}>
          <SectionLabel icon="clipboard" label="Diagnosis Summary" />
          <ResultCard result={lastResult} />
        </View>

        {/* Sensor alerts */}
        <SensorAlerts inputValues={inputValues} sensorConfig={sensorConfig} />

        {/* Chart */}
        <View style={styles.section}>
          <SectionLabel icon="bar-chart-2" label="Sensor Readings vs Ideal" />
          <View style={styles.chartCard}>
            {(
              ["density", "tds", "ph", "turbidity", "temperature"] as const
            ).map((key) => {
              if (!sensorConfig[key]) return null;
              const r = SENSOR_RANGES[key];
              return (
                <MetricBar
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={inputValues[key]}
                  ideal={r.ideal}
                  min={r.min}
                  max={r.max}
                  unit={r.unit}
                  color={METRIC_COLORS[key]}
                />
              );
            })}
          </View>
        </View>

        {/* Per-sensor scores */}
        <View style={styles.section}>
          <SectionLabel icon="layers" label="Per-Sensor Scores" />
          <View style={styles.sensorScoresGrid}>
            {(
              Object.entries(lastResult.sensorScores) as [string, number][]
            ).map(([key, score]) => {
              if (!sensorConfig[key as keyof typeof sensorConfig]) return null;
              const color = METRIC_COLORS[key];
              return (
                <View
                  key={key}
                  style={[
                    styles.sensorScoreCard,
                    { borderColor: color + "33" },
                  ]}
                >
                  <Text style={[styles.sensorScoreVal, { color }]}>{score}</Text>
                  <Text style={styles.sensorScoreKey}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={[styles.scoreBar, { backgroundColor: color + "22" }]}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: `${score}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <SectionLabel icon="message-circle" label="Recommendations" />
          <RecommendationCard result={lastResult} inputValues={inputValues} sensorConfig={sensorConfig} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.analyzeAgainBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
        >
          <MaterialCommunityIcons name="magnify-scan" size={18} color={C.tint} />
          <Text style={styles.analyzeAgainText}>Analyze Another Sample</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ── Sensor Alerts ────────────────────────────────────────────────────────────

interface AlertItem {
  label: string;
  message: string;
  severity: "ok" | "warn" | "danger";
  color: string;
  icon: string;
}

function SensorAlerts({
  inputValues,
  sensorConfig,
}: {
  inputValues: MilkSensorValues;
  sensorConfig: SensorConfig;
}) {
  const alerts: AlertItem[] = [];

  const check = (
    key: keyof MilkSensorValues,
    label: string,
    unit: string,
    okMsg: string,
    lowMsg: string,
    highMsg: string,
    color: string
  ) => {
    if (!sensorConfig[key] || inputValues[key] === null) return;
    const v = inputValues[key]!;
    const r = SENSOR_RANGES[key];
    if (v >= r.min && v <= r.max) {
      alerts.push({ label, message: `${v} ${unit} — ${okMsg}`, severity: "ok", color, icon: "check-circle" });
    } else if (v < r.min) {
      alerts.push({ label, message: `${v} ${unit} — ${lowMsg}`, severity: v < r.min * 0.85 ? "danger" : "warn", color, icon: "alert-triangle" });
    } else {
      alerts.push({ label, message: `${v} ${unit} — ${highMsg}`, severity: v > r.max * 1.15 ? "danger" : "warn", color, icon: "alert-circle" });
    }
  };

  check("density", "Density", "g/ml", "Normal range, good consistency", "Below normal — possible water addition", "Above normal — check for non-milk solids", C.tint);
  check("tds", "TDS", "ppm", "Normal dissolved solids", "Low TDS — milk may be diluted", "High TDS — possible salt or foreign ion addition", C.accent);
  check("ph", "pH", "pH", "Ideal acidity for fresh milk", "Low pH — milk may be acidic or fermenting", "High pH — possible alkaline/detergent contamination", "#A78BFA");
  check("turbidity", "Turbidity", "NTU", "Normal opacity for whole milk", "Low turbidity — milk appears watery or skimmed", "High turbidity — possible suspended solids", "#FB923C");
  check("temperature", "Temperature", "°C", "Safe temperature range", "Below expected storage temp", "High temperature — bacterial growth risk", "#F87171");

  if (alerts.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel icon="radio" label="Sensor Alerts" />
      <View style={styles.alertsCard}>
        {alerts.map((a, i) => {
          const bgColor =
            a.severity === "ok"
              ? C.success + "18"
              : a.severity === "warn"
              ? C.warning + "18"
              : C.danger + "18";
          const borderColor =
            a.severity === "ok"
              ? C.success + "44"
              : a.severity === "warn"
              ? C.warning + "44"
              : C.danger + "44";
          const iconColor =
            a.severity === "ok" ? C.success : a.severity === "warn" ? C.warning : C.danger;

          return (
            <View key={i} style={[styles.alertRow, { backgroundColor: bgColor, borderColor }]}>
              <Feather name={a.icon as any} size={15} color={iconColor} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertLabel, { color: a.color }]}>{a.label}</Text>
                <Text style={styles.alertMsg}>{a.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Recommendations ──────────────────────────────────────────────────────────

interface Suggestion {
  title: string;
  detail: string;
  icon: string;
  severity: "info" | "warn" | "danger";
}

function buildSuggestions(
  result: AnalysisResult,
  inputValues: MilkSensorValues,
  sensorConfig: SensorConfig
): Suggestion[] {
  const sugs: Suggestion[] = [];
  const issue = result.possibleIssue;
  const dilution = result.estimatedDilution;
  const ph = sensorConfig.ph ? inputValues.ph : null;
  const tds = sensorConfig.tds ? inputValues.tds : null;
  const density = sensorConfig.density ? inputValues.density : null;
  const turbidity = sensorConfig.turbidity ? inputValues.turbidity : null;

  if (issue === "None") {
    sugs.push({
      title: "Sample is within pure milk standards",
      detail: "All measured parameters fall within the FSSAI / Codex Alimentarius acceptable range for whole cow milk. The sample appears unadulterated.",
      icon: "check-circle",
      severity: "info",
    });
    sugs.push({
      title: "Continue routine quality checks",
      detail: "Even pure milk can degrade over time. Test again every 6–8 hours if stored above 10°C, or daily if refrigerated.",
      icon: "clock",
      severity: "info",
    });
    sugs.push({
      title: "Maintain cold chain",
      detail: "Optimal storage temperature is 2–4°C. Milk stored above 8°C for more than 2 hours is at risk of bacterial spoilage regardless of initial purity.",
      icon: "thermometer",
      severity: "info",
    });
  } else if (issue === "Dilution detected") {
    sugs.push({
      title: `~${dilution.toFixed(1)}% water addition estimated`,
      detail:
        dilution < 10
          ? "Minor dilution detected. Verify with a certified lactometer. This level may be within measurement tolerance."
          : dilution < 25
          ? "Moderate dilution detected. The milk does not meet FSSAI minimum standards for SNF (Solids Not Fat ≥ 8.5%). This batch should not be sold."
          : `Severe dilution of ~${dilution.toFixed(0)}% detected. Milk is significantly watered down — density, TDS, and turbidity are all well below acceptable ranges.`,
      icon: dilution < 10 ? "info" : "alert-triangle",
      severity: dilution < 10 ? "warn" : "danger",
    });
    if (density !== null) {
      sugs.push({
        title: "Verify with a certified lactometer",
        detail: `Density reading of ${density} g/ml (normal: 1.028–1.033 g/ml). A drop below 1.026 g/ml is a strong indicator of water addition. Cross-check with a calibrated lactometer.`,
        icon: "droplet",
        severity: "warn",
      });
    }
    if (tds !== null && tds < 250) {
      sugs.push({
        title: "Low dissolved solids confirm dilution",
        detail: `TDS of ${tds} ppm is below the minimum of 250 ppm expected for undiluted whole milk. Water has near-zero TDS, so any addition lowers this value proportionally.`,
        icon: "activity",
        severity: "warn",
      });
    }
    sugs.push({
      title: "Check source and handling",
      detail: "Dilution may occur at farm, collection centre, or in transit. Inspect all handling points. Consider installing a tamper-evident seal on transport containers.",
      icon: "search",
      severity: "info",
    });
  } else if (issue === "Possible salt addition") {
    sugs.push({
      title: "Elevated ions — salt addition likely",
      detail: `TDS of ${tds ?? "—"} ppm is significantly above the normal range (250–350 ppm). NaCl is commonly added to mask water dilution since it raises density artificially. Both adulterations are likely co-occurring.`,
      icon: "alert-circle",
      severity: "danger",
    });
    sugs.push({
      title: "Do not consume or sell this batch",
      detail: "Salt adulteration violates FSSAI Prevention of Food Adulteration Act. This batch must be quarantined pending lab confirmation.",
      icon: "x-circle",
      severity: "danger",
    });
    sugs.push({
      title: "Send to accredited lab for ionic analysis",
      detail: "Use ion chromatography or silver nitrate titration to confirm chloride ion (Cl⁻) concentration. Normal milk chloride: 80–100 mg/100ml. Values above 200 mg/100ml confirm salt adulteration.",
      icon: "external-link",
      severity: "warn",
    });
    sugs.push({
      title: "Report to authorities if confirmed",
      detail: "Report to state Food Safety Authority or FSSAI portal (foscos.fssai.gov.in) with lab reports. Penalties include fines and licence suspension under PFA Act.",
      icon: "flag",
      severity: "info",
    });
  } else {
    sugs.push({
      title: "Chemical contamination — discard immediately",
      detail: `pH of ${ph ?? "—"} is critically elevated (normal: 6.5–6.8). Values above 7.5 strongly suggest alkaline residue — typically from detergents (SLS, NaOH) used in equipment cleaning. Do NOT consume this milk.`,
      icon: "x-circle",
      severity: "danger",
    });
    sugs.push({
      title: "Inspect all equipment and pipelines",
      detail: "Residual detergent enters milk via improperly rinsed udder cups, storage tanks, or pipelines. Ensure thorough rinsing with potable water (minimum 3 cycles) after CIP (Clean-In-Place) procedures.",
      icon: "tool",
      severity: "danger",
    });
    if (turbidity !== null && turbidity < 650) {
      sugs.push({
        title: "Abnormally low turbidity",
        detail: `Turbidity of ${turbidity} NTU is below the expected 700–900 NTU for whole milk. Surfactants in detergents disrupt fat globule structure, reducing scattering — consistent with detergent contamination.`,
        icon: "eye",
        severity: "warn",
      });
    }
    sugs.push({
      title: "Confirm with sodium lauryl sulphate (SLS) test",
      detail: "Mix 1 ml of sample with 5 ml methylene blue solution. A blue precipitate confirms anionic surfactant. Alternatively, use the rosolic acid test for NaOH/soda ash detection.",
      icon: "external-link",
      severity: "info",
    });
    sugs.push({
      title: "Review cleaning-in-place (CIP) protocols",
      detail: "Implement mandatory conductivity checks after rinsing (target < 50 µS/cm before milk flow). Consider installing automated rinse verification sensors.",
      icon: "settings",
      severity: "info",
    });
  }

  return sugs;
}

function RecommendationCard({
  result,
  inputValues,
  sensorConfig,
}: {
  result: AnalysisResult;
  inputValues: MilkSensorValues;
  sensorConfig: SensorConfig;
}) {
  const suggestions = buildSuggestions(result, inputValues, sensorConfig);

  return (
    <View style={styles.recContainer}>
      {suggestions.map((s, i) => {
        const bgColor =
          s.severity === "info"
            ? C.accent + "14"
            : s.severity === "warn"
            ? C.warning + "14"
            : C.danger + "14";
        const borderColor =
          s.severity === "info"
            ? C.accent + "40"
            : s.severity === "warn"
            ? C.warning + "40"
            : C.danger + "40";
        const iconColor =
          s.severity === "info" ? C.accent : s.severity === "warn" ? C.warning : C.danger;

        return (
          <View key={i} style={[styles.recItem, { backgroundColor: bgColor, borderColor }]}>
            <View style={[styles.recIconWrap, { backgroundColor: iconColor + "22" }]}>
              <Feather name={s.icon as any} size={16} color={iconColor} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.recTitle, { color: iconColor }]}>{s.title}</Text>
              <Text style={styles.recDetail}>{s.detail}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Feather name={icon as any} size={14} color={C.tint} />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: C.text, fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  scoreBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 4 },
  gaugeSection: { alignItems: "center", gap: 16, marginBottom: 24 },
  gaugeLabels: { alignItems: "center", gap: 4 },
  gaugeTitle: { color: C.text, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  gaugeSubtitle: { color: C.textMuted, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { marginBottom: 20 },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  sectionLabelText: { color: C.textSecondary, fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.7 },
  chartCard: { backgroundColor: C.backgroundCard, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 16 },
  sensorScoresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sensorScoreCard: { flex: 1, minWidth: 90, backgroundColor: C.backgroundCard, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  sensorScoreVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  sensorScoreKey: { color: C.textMuted, fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  scoreBar: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  scoreBarFill: { height: 4, borderRadius: 2 },
  // Alerts
  alertsCard: { gap: 8 },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  alertLabel: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  alertMsg: { color: C.textSecondary, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  // Recommendations
  recContainer: { gap: 10 },
  recItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  recIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
  recTitle: { fontSize: 13, fontFamily: "Inter_700Bold", lineHeight: 18 },
  recDetail: { color: C.textSecondary, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  // Analyze again
  analyzeAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.tint + "44",
    backgroundColor: C.tint + "11",
    marginBottom: 8,
  },
  analyzeAgainText: { color: C.tint, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptyContainer: { flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", gap: 16 },
  emptyText: { color: C.textSecondary, fontSize: 16, fontFamily: "Inter_400Regular" },
  backBtn: { backgroundColor: C.tint, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { color: C.background, fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
