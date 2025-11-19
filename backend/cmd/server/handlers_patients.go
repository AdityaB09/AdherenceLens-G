package main

import (
	"log"
	"net/http"
	"strings"
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

// ==== DTOs ====

type CreatePatientRequest struct {
	ExternalID       string `json:"externalId"`
	Name             string `json:"name" binding:"required"`
	Age              int    `json:"age"`
	Gender           string `json:"gender"`
	PrimaryCondition string `json:"primaryCondition"`
}

type PatientListItem struct {
	ID               uint    `json:"id"`
	ExternalID       string  `json:"externalId"`
	Name             string  `json:"name"`
	Age              int     `json:"age"`
	Gender           string  `json:"gender"`
	PrimaryCondition string  `json:"primaryCondition"`
	LatestRisk       string  `json:"latestRisk"`
	LatestScore      float64 `json:"latestScore"`
}

type AddNoteRequest struct {
	Source string `json:"source"`
	Text   string `json:"text" binding:"required"`
}

// ==== Handlers ====

func (h *PatientHandler) List(c *gin.Context) {
	var patients []Patient
	if err := h.db.Order("id").Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list patients"})
		return
	}

	items := make([]PatientListItem, 0, len(patients))
	for _, p := range patients {
		var a Analysis
		err := h.db.Where("patient_id = ?", p.ID).Order("created_at DESC").First(&a).Error
		latestRisk := ""
		latestScore := 0.0
		if err == nil {
			latestRisk = string(a.Risk)
			latestScore = a.Score
		} else if err != nil && err != gorm.ErrRecordNotFound {
			log.Printf("List: failed to load latest analysis for patient %d: %v", p.ID, err)
		}

		items = append(items, PatientListItem{
			ID:               p.ID,
			ExternalID:       p.ExternalID,
			Name:             p.Name,
			Age:              p.Age,
			Gender:           p.Gender,
			PrimaryCondition: p.PrimaryCondition,
			LatestRisk:       latestRisk,
			LatestScore:      latestScore,
		})
	}

	c.JSON(http.StatusOK, items)
}

func (h *PatientHandler) Create(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ext := strings.TrimSpace(req.ExternalID)
	if ext == "" {
		ext = "AUTO-" + time.Now().Format("20060102-150405.000000000")
	}

	p := Patient{
		ExternalID:       ext,
		Name:             req.Name,
		Age:              req.Age,
		Gender:           req.Gender,
		PrimaryCondition: req.PrimaryCondition,
	}

	if err := h.db.Create(&p).Error; err != nil {
		log.Printf("Create patient error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create patient"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         p.ID,
		"externalId": p.ExternalID,
		"name":       p.Name,
	})
}

func (h *PatientHandler) GetDetail(c *gin.Context) {
	id := c.Param("id")

	var p Patient
	if err := h.db.First(&p, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load patient"})
		return
	}

	var notes []Note
	h.db.Where("patient_id = ?", p.ID).Order("timestamp DESC").Find(&notes)

	var regs []Regimen
	h.db.Where("patient_id = ?", p.ID).Find(&regs)

	var latest Analysis
	err := h.db.Where("patient_id = ?", p.ID).
		Order("created_at DESC").
		First(&latest).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Printf("GetDetail: failed to load latest analysis for patient %d: %v", p.ID, err)
	}

	c.JSON(http.StatusOK, gin.H{
		"patient":        p,
		"notes":          notes,
		"regimens":       regs,
		"latestAnalysis": ifOrNilAnalysis(err, latest),
	})
}

func ifOrNilAnalysis(err error, a Analysis) interface{} {
	if err == nil {
		return a
	}
	return nil
}

func (h *PatientHandler) AddNote(c *gin.Context) {
	id := c.Param("id")

	var p Patient
	if err := h.db.First(&p, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load patient"})
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

	c.JSON(http.StatusOK, n)
}
