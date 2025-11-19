package main

import (
    "encoding/json"
    "strings"
)

type RiskResult struct {
    Score      float64    `json:"score"`
    Level      RiskLevel  `json:"level"`
    Reasons    []string   `json:"reasons"`
    Suggestions []string  `json:"suggestions"`
    Meds       []ExtractedMed `json:"meds"`
    Features   Features   `json:"features"`
}

type RiskEngine struct{}

func NewRiskEngine() *RiskEngine {
    return &RiskEngine{}
}

func (e *RiskEngine) ComputeRisk(notes []Note, regimens []Regimen) RiskResult {
    // Concatenate recent notes
    var sb strings.Builder
    for _, n := range notes {
        sb.WriteString("\n")
        sb.WriteString(n.Text)
    }
    fullText := sb.String()

    meds := ExtractMeds(fullText)
    feats := BuildFeaturesFromText(fullText, meds)

    score := 0.0
    reasons := []string{}

    if feats.NumMeds >= 4 {
        score += 0.25
        reasons = append(reasons, "Multiple medications (polypharmacy)")
    }
    if feats.NumDailyDoses >= 3 {
        score += 0.25
        reasons = append(reasons, "High daily dosing complexity")
    }
    if feats.HasNightDose {
        score += 0.15
        reasons = append(reasons, "Night-time / bedtime dosing increases complexity")
    }
    if feats.NegativePhrases > 0 {
        score += 0.2
        reasons = append(reasons, "Negative language about medications or side effects")
    }
    if feats.ConfusingPhrases > 0 {
        score += 0.15
        reasons = append(reasons, "Ambiguous instructions such as 'as needed'")
    }

    if score > 1 {
        score = 1
    }

    level := RiskLow
    switch {
    case score >= 0.7:
        level = RiskHigh
    case score >= 0.4:
        level = RiskMedium
    }

    suggestions := e.buildSuggestions(level, feats)

    return RiskResult{
        Score:      score,
        Level:      level,
        Reasons:    reasons,
        Suggestions: suggestions,
        Meds:       meds,
        Features:   feats,
    }
}

func (e *RiskEngine) ComputeWhatIf(base Features, override Features) RiskResult {
    // Merge override: non-zero / true overrides base
    merged := base

    if override.NumMeds != 0 {
        merged.NumMeds = override.NumMeds
    }
    if override.NumDailyDoses != 0 {
        merged.NumDailyDoses = override.NumDailyDoses
    }
    if override.HasNightDose {
        merged.HasNightDose = true
    }
    if override.NegativePhrases != 0 {
        merged.NegativePhrases = override.NegativePhrases
    }
    if override.ConfusingPhrases != 0 {
        merged.ConfusingPhrases = override.ConfusingPhrases
    }

    // Now risk score using merged features (no meds list for what-if)
    score := 0.0
    reasons := []string{}

    if merged.NumMeds >= 4 {
        score += 0.25
        reasons = append(reasons, "Multiple medications (polypharmacy)")
    }
    if merged.NumDailyDoses >= 3 {
        score += 0.25
        reasons = append(reasons, "High daily dosing complexity")
    }
    if merged.HasNightDose {
        score += 0.15
        reasons = append(reasons, "Night-time / bedtime dosing increases complexity")
    }
    if merged.NegativePhrases > 0 {
        score += 0.2
        reasons = append(reasons, "Negative language about medications or side effects")
    }
    if merged.ConfusingPhrases > 0 {
        score += 0.15
        reasons = append(reasons, "Ambiguous instructions such as 'as needed'")
    }

    if score > 1 {
        score = 1
    }

    level := RiskLow
    switch {
    case score >= 0.7:
        level = RiskHigh
    case score >= 0.4:
        level = RiskMedium
    }

    suggestions := e.buildSuggestions(level, merged)

    return RiskResult{
        Score:      score,
        Level:      level,
        Reasons:    reasons,
        Suggestions: suggestions,
        Features:   merged,
    }
}

func (e *RiskEngine) buildSuggestions(level RiskLevel, f Features) []string {
    s := []string{}
    if f.NumMeds >= 4 {
        s = append(s, "Consider simplifying regimen by reducing total number of medications if clinically appropriate.")
    }
    if f.NumDailyDoses >= 3 {
        s = append(s, "Combine doses or switch to once-daily formulations where possible.")
    }
    if f.HasNightDose {
        s = append(s, "Evaluate necessity of night-time dosing; daytime dosing may improve adherence.")
    }
    if f.NegativePhrases > 0 {
        s = append(s, "Schedule counseling to address side effects and patient concerns.")
    }
    if f.ConfusingPhrases > 0 {
        s = append(s, "Replace 'as needed' instructions with clearer, structured directions.")
    }

    if len(s) == 0 && level == RiskLow {
        s = append(s, "Current regimen appears adherence-friendly; continue monitoring.")
    }
    return s
}

func (r RiskResult) ToAnalysisModel(patientID uint) Analysis {
    reasonsJSON, _ := json.Marshal(r.Reasons)
    return Analysis{
        PatientID: patientID,
        Risk:      r.Level,
        Score:     r.Score,
        Reasons:   string(reasonsJSON),
    }
}
