package main

import "time"

type Patient struct {
    ID               uint      `gorm:"primaryKey" json:"id"`
    ExternalID       string    `gorm:"size:64;uniqueIndex" json:"externalId"`
    Name             string    `gorm:"size:128" json:"name"`
    Age              int       `json:"age"`
    Gender           string    `gorm:"size:16" json:"gender"`
    PrimaryCondition string    `gorm:"size:128" json:"primaryCondition"`
    CreatedAt        time.Time `json:"createdAt"`
    UpdatedAt        time.Time `json:"updatedAt"`
    Notes            []Note    `json:"notes,omitempty"`
    Regimens         []Regimen `json:"regimens,omitempty"`
}

type Note struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    PatientID uint      `gorm:"index" json:"patientId"`
    Source    string    `gorm:"size:64" json:"source"`
    Text      string    `gorm:"type:text" json:"text"`
    Timestamp time.Time `json:"timestamp"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type Regimen struct {
    ID         uint      `gorm:"primaryKey" json:"id"`
    PatientID  uint      `gorm:"index" json:"patientId"`
    Medication string    `gorm:"size:128" json:"medication"`
    Dosage     string    `gorm:"size:64" json:"dosage"`
    Frequency  string    `gorm:"size:64" json:"frequency"`
    TimeOfDay  string    `gorm:"size:32" json:"timeOfDay"`
    Active     bool      `gorm:"default:true" json:"active"`
    CreatedAt  time.Time `json:"createdAt"`
    UpdatedAt  time.Time `json:"updatedAt"`
}

type RiskLevel string

const (
    RiskLow    RiskLevel = "LOW"
    RiskMedium RiskLevel = "MEDIUM"
    RiskHigh   RiskLevel = "HIGH"
)

type Analysis struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    PatientID uint      `gorm:"index" json:"patientId"`
    Risk      RiskLevel `gorm:"size:16" json:"risk"`
    Score     float64   `json:"score"`   // 0–1
    Reasons   string    `gorm:"type:text" json:"reasons"` // JSON array
    CreatedAt time.Time `json:"createdAt"`
}
