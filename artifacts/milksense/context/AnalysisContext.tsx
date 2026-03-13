import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  AnalysisResult,
  AppMode,
  MilkSensorValues,
  SampleHistory,
  SensorConfig,
} from "@/models/milk_sample";

const STORAGE_KEY = "@milksense_history";

interface AnalysisContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  sensorConfig: SensorConfig;
  setSensorConfig: (config: SensorConfig) => void;
  inputValues: MilkSensorValues;
  setInputValues: (values: MilkSensorValues) => void;
  lastResult: AnalysisResult | null;
  setLastResult: (result: AnalysisResult | null) => void;
  history: SampleHistory[];
  addToHistory: (entry: SampleHistory) => void;
  clearHistory: () => void;
  isLoading: boolean;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

const DEFAULT_CONFIG: SensorConfig = {
  density: true,
  tds: true,
  ph: true,
  turbidity: true,
  temperature: true,
};

const DEFAULT_VALUES: MilkSensorValues = {
  density: null,
  tds: null,
  ph: null,
  turbidity: null,
  temperature: null,
};

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("manual");
  const [sensorConfig, setSensorConfig] = useState<SensorConfig>(DEFAULT_CONFIG);
  const [inputValues, setInputValues] = useState<MilkSensorValues>(DEFAULT_VALUES);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SampleHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: SampleHistory[] = JSON.parse(stored);
          setHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addToHistory = useCallback(async (entry: SampleHistory) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        mode,
        setMode,
        sensorConfig,
        setSensorConfig,
        inputValues,
        setInputValues,
        lastResult,
        setLastResult,
        history,
        addToHistory,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextType {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
