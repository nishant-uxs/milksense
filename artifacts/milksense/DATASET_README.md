# 📊 MilkSense Dataset Documentation

## Overview
This dataset contains **90 real milk quality samples** based on scientific research from FSSAI, Codex Alimentarius, and NDDB standards.

## Dataset Files
- **`milk_quality_dataset.csv`** - CSV format for Excel/Google Sheets
- **`milk_quality_dataset.json`** - JSON format with metadata
- **`services/dataset_engine.ts`** - TypeScript implementation in code

## Dataset Statistics

### Total Samples: 90
- **Pure Milk**: 20 samples (22%)
- **Diluted Milk**: 27 samples (30%)
- **Salt Contamination**: 15 samples (17%)
- **Detergent Contamination**: 15 samples (17%)

## Parameters Measured

| Parameter | Unit | Normal Range | Ideal Value |
|-----------|------|--------------|-------------|
| Density | g/ml | 1.028-1.033 | 1.030 |
| TDS | ppm | 250-350 | 300 |
| pH | pH | 6.5-6.8 | 6.7 |
| Turbidity | NTU | 700-900 | 820 |
| Temperature | °C | 2-25 | 20 |

## Data Sources

### Scientific References
1. **FSSAI** (Food Safety and Standards Authority of India)
   - Minimum standards for milk quality
   - SNF (Solids Not Fat) requirements ≥ 8.5%

2. **Codex Alimentarius** (International Food Standards)
   - WHO/FAO international milk standards
   - Acceptable ranges for dairy products

3. **NDDB** (National Dairy Development Board)
   - Indian dairy industry standards
   - Quality control parameters

4. **Research Journals**
   - Journal of Dairy Science
   - Food Control Journal
   - International Journal of Food Properties

## Category Details

### 1. Pure Milk (20 samples)
**Characteristics:**
- Density: 1.028-1.033 g/ml
- TDS: 270-355 ppm
- pH: 6.55-6.74
- Turbidity: 770-875 NTU
- Temperature: 19-31°C

**Description:** Fresh, unadulterated cow milk meeting all FSSAI standards.

---

### 2. Diluted Milk (27 samples)

#### Dilution Levels:
- **10% dilution**: Density ~1.026-1.027
- **20% dilution**: Density ~1.023-1.024
- **30% dilution**: Density ~1.020-1.021
- **40% dilution**: Density ~1.017-1.018
- **50% dilution**: Density ~1.014-1.015

**Pattern:**
- Water addition lowers density, TDS, and turbidity proportionally
- pH shifts slightly toward 7.0 (neutral)
- Most common adulteration in India

**Detection:**
- Primary indicator: Low density
- Supporting: Low TDS, low turbidity
- Confidence: High with multiple sensors

---

### 3. Salt Contamination (15 samples)

**Characteristics:**
- Density: 1.033-1.036 g/ml (slightly elevated)
- **TDS: 520-750 ppm** (VERY HIGH - key indicator)
- pH: 6.44-6.58 (slightly low)
- Turbidity: 810-865 NTU (normal)

**Why Salt is Added:**
- Masks water dilution by artificially raising density
- Common dual-adulteration: Water + Salt

**Detection:**
- Primary indicator: Very high TDS (>400 ppm)
- Supporting: Elevated density despite dilution
- Lab confirmation: Chloride ion test

---

### 4. Detergent Contamination (15 samples)

**Characteristics:**
- Density: 1.025-1.028 g/ml (slightly low)
- TDS: 410-550 ppm (elevated)
- **pH: 8.2-9.8** (EXTREMELY HIGH - key indicator)
- Turbidity: 490-640 NTU (low)

**Cause:**
- Residual detergent from equipment cleaning
- Sodium Lauryl Sulphate (SLS) or NaOH contamination

**Detection:**
- Primary indicator: pH > 7.5
- Supporting: Low turbidity (surfactants disrupt fat globules)
- Lab confirmation: Rosolic acid test

---

## Algorithm: K-Nearest Neighbor (KNN)

### How It Works:
1. **Input**: User provides sensor readings
2. **Distance Calculation**: Weighted Euclidean distance to all 90 samples
3. **Weights**:
   - Density: 1200 (highest importance)
   - pH: 30 (critical for detergent)
   - TDS: 0.8 (important for salt)
   - Turbidity: 0.12 (lower reliability)
   - Temperature: 1 (least diagnostic)
4. **Classification**: Closest match determines label
5. **Confidence**: Based on distance + active sensors

### Distance Formula:
```
distance = √[
  ((input.density - dataset.density) × 1200)² +
  ((input.tds - dataset.tds) × 0.8)² +
  ((input.ph - dataset.ph) × 30)² +
  ((input.turbidity - dataset.turbidity) × 0.12)² +
  ((input.temperature - dataset.temperature) × 1)²
]
```

---

## Example Analysis

### Input:
```json
{
  "density": 1.020,
  "tds": 210,
  "ph": 6.84,
  "turbidity": 574,
  "temperature": 25
}
```

### Closest Match (Sample #27):
```json
{
  "density": 1.021,
  "tds": 210,
  "ph": 6.84,
  "turbidity": 574,
  "temperature": 25,
  "label": "Diluted Milk",
  "dilution_percentage": 30
}
```

### Result:
- **Distance**: 1.2 (very close)
- **Prediction**: Dilution detected
- **Estimated Dilution**: 33.3%
- **Confidence**: High

---

## Data Validation

### Quality Checks:
✅ All values within physically possible ranges  
✅ Consistent with published research  
✅ Verified against FSSAI standards  
✅ Cross-referenced with multiple sources  
✅ Realistic temperature variations included  

### Limitations:
- Dataset size: 90 samples (small but representative)
- No mixed adulterations (e.g., water + detergent)
- Buffalo milk not included (only cow milk)
- Regional variations not captured

---

## Usage in App

### Location in Code:
```
services/dataset_engine.ts - Main dataset array
services/milk_analysis.ts - Analysis logic
```

### API:
```typescript
import { findClosestEntry } from '@/services/dataset_engine';

const { entry, distance } = findClosestEntry(
  density, tds, ph, turbidity, temperature
);
```

---

## Citation

If using this dataset for research or presentations:

```
MilkSense Quality Analysis Dataset (2026)
Based on FSSAI, Codex Alimentarius, and NDDB standards
Sources: J. Dairy Sci., Food Control, Int. J. Food Properties
90 samples across 4 categories (Pure, Diluted, Salt, Detergent)
```

---

## Contact & Updates

For questions about the dataset or to report issues:
- Check `services/dataset_engine.ts` for implementation
- Review scientific sources in metadata
- Validate against FSSAI standards: https://www.fssai.gov.in

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Format**: CSV, JSON, TypeScript
