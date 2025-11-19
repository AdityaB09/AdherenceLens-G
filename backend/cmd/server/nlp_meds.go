package main

import (
    "regexp"
    "strings"
)

var dosageRegex = regexp.MustCompile(`\b(\d+\s?(mg|mcg|g))\b`)
var freqRegex = regexp.MustCompile(`\b(once daily|twice daily|bid|tid|qhs)\b`)

type ExtractedMed struct {
    Name      string `json:"name"`
    Dosage    string `json:"dosage"`
    Frequency string `json:"frequency"`
}

type Features struct {
    NumMeds          int  `json:"numMeds"`
    NumDailyDoses    int  `json:"numDailyDoses"`
    HasNightDose     bool `json:"hasNightDose"`
    NegativePhrases  int  `json:"negativePhrases"`
    ConfusingPhrases int  `json:"confusingPhrases"`
}

var medDictionary = []string{"metformin", "atorvastatin", "lisinopril", "insulin"}
var negativeTokens = []string{
    "forget", "miss", "skipped", "skip", "side effect", "tired of", "don't like", "dont like",
}
var confusingTokens = []string{
    "as needed", "prn", "when required",
}

func ExtractMeds(text string) []ExtractedMed {
    lower := strings.ToLower(text)
    var out []ExtractedMed

    for _, m := range medDictionary {
        if strings.Contains(lower, m) {
            dosage := ""
            if d := dosageRegex.FindString(lower); d != "" {
                dosage = d
            }
            freq := ""
            if f := freqRegex.FindString(lower); f != "" {
                freq = f
            }
            out = append(out, ExtractedMed{
                Name:      m,
                Dosage:    dosage,
                Frequency: freq,
            })
        }
    }
    return out
}

func BuildFeaturesFromText(text string, meds []ExtractedMed) Features {
    lower := strings.ToLower(text)
    f := Features{
        NumMeds: len(meds),
    }

    for _, m := range meds {
        if m.Frequency != "" {
            f.NumDailyDoses++
        }
        if strings.Contains(m.Frequency, "qhs") || strings.Contains(lower, "bedtime") || strings.Contains(lower, "night") {
            f.HasNightDose = true
        }
    }

    for _, t := range negativeTokens {
        if strings.Contains(lower, t) {
            f.NegativePhrases++
        }
    }
    for _, t := range confusingTokens {
        if strings.Contains(lower, t) {
            f.ConfusingPhrases++
        }
    }

    return f
}
