import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { AnalysisResult } from "@/models/milk_sample";
import {
  getConfidenceColor,
  getIssueColor,
  getScoreColor,
} from "@/services/milk_analysis";

const C = Colors.light;

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const issueColor = getIssueColor(result.possibleIssue);
  const confColor = getConfidenceColor(result.confidence);
  const scoreColor = getScoreColor(result.qualityScore);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MetricItem
          icon={<MaterialCommunityIcons name="water-check" size={18} color={issueColor} />}
          label="Diagnosis"
          value={result.possibleIssue === "None" ? "Pure Milk" : result.possibleIssue}
          color={issueColor}
          accent={issueColor}
        />
        <View style={styles.divider} />
        <MetricItem
          icon={<Feather name="droplet" size={18} color={C.accent} />}
          label="Dilution"
          value={`~${result.estimatedDilution.toFixed(1)}%`}
          color={
            result.estimatedDilution < 5
              ? C.success
              : result.estimatedDilution < 15
              ? C.warning
              : C.danger
          }
          accent={C.accent}
        />
        <View style={styles.divider} />
        <MetricItem
          icon={<Feather name="target" size={18} color={confColor} />}
          label="Confidence"
          value={result.confidence}
          color={confColor}
          accent={confColor}
        />
      </View>

      <View style={[styles.matchBadge, { borderColor: issueColor + "44" }]}>
        <Text style={styles.matchLabel}>Matched Sample</Text>
        <Text style={[styles.matchValue, { color: issueColor }]}>
          {result.matchedLabel}
        </Text>
      </View>
    </View>
  );
}

function MetricItem({
  icon,
  label,
  value,
  color,
  accent,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  color: string;
  accent: string;
}) {
  return (
    <View style={styles.metricItem}>
      <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
        {icon}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.backgroundCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: C.border,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  matchBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.backgroundInput,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  matchLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  matchValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
