import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

interface MetricBarProps {
  label: string;
  value: number | null;
  ideal: number;
  min: number;
  max: number;
  unit: string;
  color: string;
}

export default function MetricBar({
  label,
  value,
  ideal,
  min,
  max,
  unit,
  color,
}: MetricBarProps) {
  const extendedMin = min - (max - min) * 0.2;
  const extendedMax = max + (max - min) * 0.2;
  const totalRange = extendedMax - extendedMin;

  const toPercent = (v: number) =>
    Math.max(0, Math.min(1, (v - extendedMin) / totalRange));

  const idealPercent = toPercent(ideal);
  const valuePercent = value !== null ? toPercent(value) : 0;

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: valuePercent,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [valuePercent]);

  const inRange = value !== null && value >= min && value <= max;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          {value !== null ? (
            <>
              <Text style={[styles.value, { color: inRange ? C.success : C.warning }]}>
                {value}
              </Text>
              <Text style={styles.unit}> {unit}</Text>
            </>
          ) : (
            <Text style={styles.na}>N/A</Text>
          )}
        </View>
      </View>

      <View style={styles.barTrack}>
        {value !== null && (
          <Animated.View
            style={[
              styles.barFill,
              {
                width: animWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: inRange ? color : C.warning,
              },
            ]}
          />
        )}

        <View
          style={[
            styles.idealMarker,
            { left: `${idealPercent * 100}%` as any },
          ]}
        />

        <View
          style={[
            styles.rangeIndicator,
            {
              left: `${toPercent(min) * 100}%` as any,
              right: `${(1 - toPercent(max)) * 100}%` as any,
            },
          ]}
        />
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>{min}</Text>
        <Text style={[styles.scaleLabel, { color: C.tint }]}>ideal: {ideal}</Text>
        <Text style={styles.scaleLabel}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  unit: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  na: {
    color: C.textMuted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  barTrack: {
    height: 8,
    backgroundColor: C.backgroundInput,
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  idealMarker: {
    position: "absolute",
    top: -3,
    width: 2,
    height: 14,
    backgroundColor: C.tint,
    borderRadius: 1,
    marginLeft: -1,
  },
  rangeIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,201,167,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,201,167,0.25)",
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  scaleLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
