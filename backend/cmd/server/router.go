package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewRouter(db *gorm.DB, engine *RiskEngine) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// Simple CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	patientHandler := NewPatientHandler(db)
	analysisHandler := NewAnalysisHandler(db, engine)

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Patients & notes
		api.GET("/patients", patientHandler.List)
		api.POST("/patients", patientHandler.Create)
		api.GET("/patients/:id", patientHandler.GetDetail)
		api.POST("/patients/:id/notes", patientHandler.AddNote)

		// Analyze & risk
		api.POST("/patients/:id/analyze", analysisHandler.AnalyzePatient)
		api.GET("/patients/:id/analysis/latest", analysisHandler.GetLatest)

		// What-if simulation
		api.POST("/patients/:id/whatif", analysisHandler.SimulateWhatIf)
	}

	return r
}
