package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AnalysisHandler struct {
	db     *gorm.DB
	engine *RiskEngine
}

func NewAnalysisHandler(db *gorm.DB, engine *RiskEngine) *AnalysisHandler {
	return &AnalysisHandler{db: db, engine: engine}
}

type AnalyzeResponse struct {
	Analysis Analysis   `json:"analysis"`
	Risk     RiskResult `json:"risk"`
}

func (h *AnalysisHandler) AnalyzePatient(c *gin.Context) {
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

	// ✅ Use ComputeRisk only (CompleteRisk never existed)
	risk := h.engine.ComputeRisk(notes, regs)

	analysis := risk.ToAnalysisModel(p.ID)
	if err := h.db.Create(&analysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save analysis"})
		return
	}

	c.JSON(http.StatusOK, AnalyzeResponse{
		Analysis: analysis,
		Risk:     risk,
	})
}

func (h *AnalysisHandler) GetLatest(c *gin.Context) {
	id := c.Param("id")

	var p Patient
	if err := h.db.First(&p, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}

	var analysis Analysis
	if err := h.db.Where("patient_id = ?", p.ID).
		Order("created_at DESC").
		First(&analysis).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no analysis found"})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

type WhatIfRequest struct {
	NumMeds          int  `json:"numMeds"`
	NumDailyDoses    int  `json:"numDailyDoses"`
	HasNightDose     bool `json:"hasNightDose"`
	NegativePhrases  int  `json:"negativePhrases"`
	ConfusingPhrases int  `json:"confusingPhrases"`
}

type WhatIfResponse struct {
	Baseline RiskResult `json:"baseline"`
	WhatIf   RiskResult `json:"whatIf"`
	Delta    float64    `json:"delta"` // what-if score - baseline score
}

func (h *AnalysisHandler) SimulateWhatIf(c *gin.Context) {
	id := c.Param("id")

	var p Patient
	if err := h.db.First(&p, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}

	// baseline from notes
	var notes []Note
	h.db.Where("patient_id = ?", p.ID).Order("timestamp DESC").Limit(20).Find(&notes)
	var regs []Regimen
	h.db.Where("patient_id = ?", p.ID).Find(&regs)

	baseline := h.engine.ComputeRisk(notes, regs)

	var req WhatIfRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	override := Features{
		NumMeds:          req.NumMeds,
		NumDailyDoses:    req.NumDailyDoses,
		HasNightDose:     req.HasNightDose,
		NegativePhrases:  req.NegativePhrases,
		ConfusingPhrases: req.ConfusingPhrases,
	}

	whatIf := h.engine.ComputeWhatIf(baseline.Features, override)

	c.JSON(http.StatusOK, WhatIfResponse{
		Baseline: baseline,
		WhatIf:   whatIf,
		Delta:    whatIf.Score - baseline.Score,
	})
}
