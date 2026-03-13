import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAnalysis } from "@/context/AnalysisContext";
import type { SampleHistory } from "@/models/milk_sample";
import { getIssueColor, getScoreColor } from "@/services/milk_analysis";

const C = Colors.light;

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, clearHistory, isLoading } = useAnalysis();

  const handleClear = () => {
    Alert.alert("Clear History", "Remove all saved analysis results?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => {
          clearHistory();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          },
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
        <Text style={styles.headerTitle}>Analysis History</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="inbox" size={48} color={C.border} />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>
            Analyze a milk sample to see results here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Platform.OS === "web" ? 120 : insets.bottom + 32,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {history.map((item, idx) => (
            <HistoryItem key={item.id} item={item} index={idx} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function HistoryItem({ item, index }: { item: SampleHistory; index: number }) {
  const scoreColor = getScoreColor(item.result.qualityScore);
  const issueColor = getIssueColor(item.result.possibleIssue);
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  const activeCount = Object.values(item.sensorConfig).filter(Boolean).length;

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardTop}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreVal, { color: scoreColor }]}>
            {item.result.qualityScore}
          </Text>
          <Text style={styles.scoreSmall}>/100</Text>
        </View>

        <View style={styles.cardMid}>
          <Text style={[styles.label, { color: issueColor }]}>
            {item.result.matchedLabel}
          </Text>
          {item.result.possibleIssue !== "None" && (
            <Text style={styles.issueText}>{item.result.possibleIssue}</Text>
          )}
          <View style={styles.metaRow}>
            <Feather name="radio" size={11} color={C.textMuted} />
            <Text style={styles.metaText}>{activeCount} sensors</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>
              {item.result.estimatedDilution.toFixed(1)}% dilution
            </Text>
          </View>
        </View>

        <View style={styles.cardTime}>
          <Text style={styles.timeText}>{timeStr}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
          <View style={[styles.confBadge, { backgroundColor: C.textMuted + "22" }]}>
            <Text style={styles.confText}>{item.result.confidence}</Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            {
              width: `${item.result.qualityScore}%` as any,
              backgroundColor: scoreColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  clearText: {
    color: C.danger,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  historyCard: {
    backgroundColor: C.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.backgroundInput,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  scoreVal: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  scoreSmall: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  cardMid: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    lineHeight: 20,
  },
  issueText: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  metaSep: {
    color: C.textMuted,
    fontSize: 11,
  },
  cardTime: {
    alignItems: "flex-end",
    gap: 3,
  },
  timeText: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dateText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  confBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  confText: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  scoreBarTrack: {
    height: 3,
    backgroundColor: C.backgroundInput,
    borderRadius: 2,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 3,
    borderRadius: 2,
  },
});
