import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getScoreColor, getScoreLabel } from "@/services/milk_analysis";

const C = Colors.light;

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 140 }: ScoreGaugeProps) {
  const animatedScore = useRef(new Animated.Value(0)).current;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayedScore = useRef(0);

  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const listener = animatedScore.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => animatedScore.removeListener(listener);
  }, [score]);

  const progress = score / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.track, { borderRadius: size / 2, borderColor: C.border + "66" }]} />
      <View style={styles.center}>
        <Text style={[styles.score, { color }]}>{displayScore}</Text>
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
      <View style={[styles.ring, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: "transparent",
        borderTopColor: color,
        borderRightColor: progress > 0.25 ? color : "transparent",
        borderBottomColor: progress > 0.5 ? color : "transparent",
        borderLeftColor: progress > 0.75 ? color : "transparent",
        transform: [{ rotate: "-90deg" }],
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 10,
    borderColor: "rgba(30,45,61,0.8)",
  },
  ring: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  score: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    lineHeight: 44,
  },
  scoreLabel: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
});
