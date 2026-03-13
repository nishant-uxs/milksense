import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import type { SensorKey } from "@/models/milk_sample";
import { SENSOR_LABELS, SENSOR_RANGES } from "@/models/milk_sample";

const C = Colors.light;

interface SensorInputProps {
  sensorKey: SensorKey;
  enabled: boolean;
  value: number | null;
  onToggle: (key: SensorKey, value: boolean) => void;
  onChangeValue: (key: SensorKey, value: number | null) => void;
}

const ICON_MAP: Record<SensorKey, JSX.Element> = {
  density: <MaterialCommunityIcons name="water" size={16} color={C.tint} />,
  tds: <MaterialCommunityIcons name="sine-wave" size={16} color={C.accent} />,
  ph: <MaterialCommunityIcons name="flask" size={16} color="#A78BFA" />,
  turbidity: <Feather name="eye" size={16} color="#FB923C" />,
  temperature: <MaterialCommunityIcons name="thermometer" size={16} color="#F87171" />,
};

const ACCENT_MAP: Record<SensorKey, string> = {
  density: C.tint,
  tds: C.accent,
  ph: "#A78BFA",
  turbidity: "#FB923C",
  temperature: "#F87171",
};

export default function SensorInput({
  sensorKey,
  enabled,
  value,
  onToggle,
  onChangeValue,
}: SensorInputProps) {
  const [focused, setFocused] = useState(false);
  const range = SENSOR_RANGES[sensorKey];
  const accentColor = ACCENT_MAP[sensorKey];
  const label = SENSOR_LABELS[sensorKey];

  const handleChange = (text: string) => {
    if (text === "" || text === "-") {
      onChangeValue(sensorKey, null);
      return;
    }
    const num = parseFloat(text);
    onChangeValue(sensorKey, isNaN(num) ? null : num);
  };

  const inRange =
    value !== null && value >= range.min && value <= range.max;
  const outRange = value !== null && !inRange;

  return (
    <View
      style={[
        styles.container,
        focused && { borderColor: accentColor },
        !enabled && styles.disabled,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.iconBadge, { backgroundColor: accentColor + "22" }]}>
            {ICON_MAP[sensorKey]}
          </View>
          <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.rangeText}>
              {range.min} – {range.max} {range.unit}
            </Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={(v) => onToggle(sensorKey, v)}
          trackColor={{ false: C.border, true: accentColor + "66" }}
          thumbColor={enabled ? accentColor : C.textMuted}
          ios_backgroundColor={C.border}
        />
      </View>

      {enabled && (
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              focused && { borderColor: accentColor },
              outRange && styles.inputWarn,
              inRange && styles.inputOk,
            ]}
            value={value !== null ? String(value) : ""}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`e.g. ${range.ideal}`}
            placeholderTextColor={C.textMuted}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            returnKeyType="done"
          />
          <View style={[styles.unitBadge, { backgroundColor: accentColor + "22" }]}>
            <Text style={[styles.unit, { color: accentColor }]}>{range.unit}</Text>
          </View>
          {outRange && (
            <View style={styles.warningBadge}>
              <Feather name="alert-triangle" size={12} color={C.warning} />
            </View>
          )}
          {inRange && (
            <View style={styles.okBadge}>
              <Feather name="check-circle" size={12} color={C.success} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  rangeText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: C.backgroundInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  inputWarn: {
    borderColor: "#F59E0B",
  },
  inputOk: {
    borderColor: "#22C55E55",
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unit: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  warningBadge: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  okBadge: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
