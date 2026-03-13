import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import SensorInput from "@/components/SensorInput";
import { useAnalysis } from "@/context/AnalysisContext";
import type { SensorKey, SampleHistory } from "@/models/milk_sample";
import { analyzeMilkSample } from "@/services/milk_analysis";

const C = Colors.light;
const SENSOR_KEYS: SensorKey[] = ["density", "tds", "ph", "turbidity", "temperature"];

export default function InputScreen() {
  const insets = useSafeAreaInsets();
  const { sensorConfig, setSensorConfig, inputValues, setInputValues, setLastResult, addToHistory } =
    useAnalysis();
  const [analyzing, setAnalyzing] = useState(false);

  const handleToggle = useCallback(
    (key: SensorKey, enabled: boolean) => {
      setSensorConfig({ ...sensorConfig, [key]: enabled });
      if (!enabled) {
        setInputValues({ ...inputValues, [key]: null });
      }
      Haptics.selectionAsync();
    },
    [sensorConfig, inputValues]
  );

  const handleValueChange = useCallback(
    (key: SensorKey, value: number | null) => {
      setInputValues({ ...inputValues, [key]: value });
    },
    [inputValues]
  );

  const hasAnyInput = SENSOR_KEYS.some(
    (k) => sensorConfig[k] && inputValues[k] !== null
  );

  const handleAnalyze = async () => {
    if (!hasAnyInput) {
      Alert.alert("No data", "Enable at least one sensor and enter a value.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnalyzing(true);

    setTimeout(() => {
      const result = analyzeMilkSample(inputValues, sensorConfig);
      const history: SampleHistory = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        inputValues: { ...inputValues },
        sensorConfig: { ...sensorConfig },
        result,
        timestamp: result.timestamp,
      };
      setLastResult(result);
      addToHistory(history);
      setAnalyzing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/result");
    }, 800);
  };

  const enabledCount = SENSOR_KEYS.filter((k) => sensorConfig[k]).length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          },
        ]}
      >
        <View>
          <Text style={styles.appName}>MilkSense</Text>
          <Text style={styles.subtitle}>IoT Quality Analyzer</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.modeBadge}>
            <MaterialCommunityIcons name="pencil-outline" size={12} color={C.tint} />
            <Text style={styles.modeText}>Manual</Text>
          </View>
          <Pressable
            style={styles.historyBtn}
            onPress={() => router.push("/history")}
          >
            <Feather name="clock" size={20} color={C.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === "web"
                ? 120
                : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="tune" size={16} color={C.tint} />
          <Text style={styles.sectionTitle}>Sensor Configuration</Text>
          <View style={styles.sensorCountBadge}>
            <Text style={styles.sensorCount}>{enabledCount} active</Text>
          </View>
        </View>

        {SENSOR_KEYS.map((key) => (
          <SensorInput
            key={key}
            sensorKey={key}
            enabled={sensorConfig[key]}
            value={inputValues[key]}
            onToggle={handleToggle}
            onChangeValue={handleValueChange}
          />
        ))}

        <View style={styles.sensorNotice}>
          <Feather name="wifi" size={13} color={C.textMuted} />
          <Text style={styles.noticeText}>
            ESP32 sensor mode coming soon — connect your hardware for automatic readings
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.analyzeBar,
          {
            paddingBottom:
              Platform.OS === "web"
                ? 34
                : insets.bottom + 16,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.analyzeButton,
            !hasAnyInput && styles.analyzeDisabled,
            pressed && hasAnyInput && styles.analyzePressed,
          ]}
          onPress={handleAnalyze}
          disabled={analyzing || !hasAnyInput}
        >
          {analyzing ? (
            <ActivityIndicator color={C.background} size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="magnify-scan" size={20} color={C.background} />
              <Text style={styles.analyzeText}>Analyze Milk Sample</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  appName: {
    color: C.text,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: C.tint,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.tint + "22",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  modeText: {
    color: C.tint,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  historyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  sensorCountBadge: {
    backgroundColor: C.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  sensorCount: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  sensorNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.backgroundCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
  },
  noticeText: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
  analyzeBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.background,
  },
  analyzeButton: {
    backgroundColor: C.tint,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  analyzeDisabled: {
    opacity: 0.4,
  },
  analyzePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  analyzeText: {
    color: C.background,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
});
