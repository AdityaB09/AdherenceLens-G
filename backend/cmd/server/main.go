package main

import (
	"log"
	"time"

	"gorm.io/gorm"
)

func main() {
	cfg := LoadConfig()

	db := InitDB(cfg)
	seedIfEmpty(db)

	engine := NewRiskEngine()

	r := NewRouter(db, engine)

	addr := ":" + cfg.Port
	log.Printf("AdherenceLens-G API listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server exited: %v", err)
	}
}

// seed one demo patient so the UI isn't empty
func seedIfEmpty(dbInstance *gorm.DB) {
	var count int64
	dbInstance.Model(&Patient{}).Count(&count)
	if count > 0 {
		return
	}

	p := Patient{
		ExternalID:       "P-1001",
		Name:             "Jane Doe",
		Age:              65,
		Gender:           "F",
		PrimaryCondition: "Type 2 diabetes",
	}
	dbInstance.Create(&p)

	note := Note{
		PatientID: p.ID,
		Source:    "discharge",
		Text:      "65-year-old female with type 2 diabetes, HbA1c 9.0%. Reports forgetting evening metformin dose and feeling tired of injections.",
		Timestamp: time.Now().UTC(),
	}
	dbInstance.Create(&note)

	reg := Regimen{
		PatientID:  p.ID,
		Medication: "Metformin",
		Dosage:     "500 mg",
		Frequency:  "BID",
		TimeOfDay:  "morning, night",
		Active:     true,
	}
	dbInstance.Create(&reg)

	log.Println("Seeded example patient Jane Doe")
}
