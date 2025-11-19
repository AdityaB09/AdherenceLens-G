package main

import (
    "fmt"
    "log"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var db *gorm.DB

func InitDB(cfg Config) *gorm.DB {
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
        cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
    )

    database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("failed to connect to database: %v", err)
    }

    // Auto-migrate
    if err := database.AutoMigrate(&Patient{}, &Note{}, &Regimen{}, &Analysis{}); err != nil {
        log.Fatalf("failed to migrate database: %v", err)
    }

    db = database
    log.Println("Database connected & migrated")
    return db
}

func GetDB() *gorm.DB {
    return db
}
