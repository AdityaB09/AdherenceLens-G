package main

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type PatientHandler struct {
    db *gorm.DB
}

func NewPatientHandler(db *gorm.DB) *PatientHandler {
    return &PatientHandler{db: db}
}

type CreatePatientRequest struct {
    ExternalID       string `json:"externalId"`
    Name             string `json:"name" binding:"required"`
    Age              int    `json:"age"`
    Gender           string `json:"gender"`
    PrimaryCondition string `json:"primaryCondition"`
}

type AddNoteRequest struct {
    Source string `json:"source"`
    Text   string `json:"text" binding:"required"`
}

func (h *PatientHandler) List(c *gin.Context) {
    var patients []Patient
    if err := h.db.Find(&patients).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list patients"})
        return
    }

    // Attach latest analysis for dashboard
    type PatientWithRisk struct {
        Patient
        LatestRisk  RiskLevel `json:"latestRisk"`
        LatestScore float64   `json:"latestScore"`
    }

    var out []PatientWithRisk
    for _, p := range patients {
        var analysis Analysis
        h.db.Where("patient_id = ?", p.ID).Order("created_at DESC").First(&analysis)
        item := PatientWithRisk{
            Patient:     p,
            LatestRisk:  analysis.Risk,
            LatestScore: analysis.Score,
        }
        out = append(out, item)
    }

    c.JSON(http.StatusOK, out)
}

func (h *PatientHandler) Create(c *gin.Context) {
    var req CreatePatientRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    p := Patient{
        ExternalID:       req.ExternalID,
        Name:             req.Name,
        Age:              req.Age,
        Gender:           req.Gender,
        PrimaryCondition: req.PrimaryCondition,
    }

    if err := h.db.Create(&p).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create patient"})
        return
    }

    c.JSON(http.StatusCreated, p)
}

type PatientDetailResponse struct {
    Patient        Patient     `json:"patient"`
    Notes          []Note      `json:"notes"`
    Regimens       []Regimen   `json:"regimens"`
    LatestAnalysis *Analysis   `json:"latestAnalysis,omitempty"`
}

func (h *PatientHandler) GetDetail(c *gin.Context) {
    id := c.Param("id")

    var p Patient
    if err := h.db.First(&p, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
        return
    }

    var notes []Note
    h.db.Where("patient_id = ?", p.ID).Order("timestamp DESC").Limit(20).Find(&notes)

    var regs []Regimen
    h.db.Where("patient_id = ?", p.ID).Find(&regs)

    var analysis Analysis
    result := h.db.Where("patient_id = ?", p.ID).Order("created_at DESC").First(&analysis)

    resp := PatientDetailResponse{
        Patient:  p,
        Notes:    notes,
        Regimens: regs,
    }
    if result.Error == nil {
        resp.LatestAnalysis = &analysis
    }

    c.JSON(http.StatusOK, resp)
}

func (h *PatientHandler) AddNote(c *gin.Context) {
    id := c.Param("id")

    var p Patient
    if err := h.db.First(&p, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
        return
    }

    var req AddNoteRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    n := Note{
        PatientID: p.ID,
        Source:    req.Source,
        Text:      req.Text,
        Timestamp: time.Now().UTC(),
    }

    if err := h.db.Create(&n).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add note"})
        return
    }

    c.JSON(http.StatusCreated, n)
}
