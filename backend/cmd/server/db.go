package main

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func InitDB(cfg Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
	)

	var database *gorm.DB
	var err error

	maxAttempts := 10
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Printf("Database connected on attempt %d", attempt)
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", attempt, maxAttempts, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("failed to connect to database after %d attempts: %v", maxAttempts, err)
	}

	if err := database.AutoMigrate(&Patient{}, &Note{}, &Regimen{}, &Analysis{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	db = database
	log.Println("Database migrated successfully")
	return db
}

func GetDB() *gorm.DB {
	return db
}
