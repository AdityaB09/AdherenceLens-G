package main

import (
    "log"
    "os"

    "github.com/joho/godotenv"
)

type Config struct {
    Port      string
    DBHost    string
    DBPort    string
    DBUser    string
    DBPass    string
    DBName    string
    DBSSLMode string
}

func LoadConfig() Config {
    // Load from .env if present
    _ = godotenv.Load()

    cfg := Config{
        Port:      getEnv("PORT", "8080"),
        DBHost:    getEnv("DB_HOST", "db"),
        DBPort:    getEnv("DB_PORT", "5432"),
        DBUser:    getEnv("DB_USER", "adherencelens"),
        DBPass:    getEnv("DB_PASSWORD", "adherencelens"),
        DBName:    getEnv("DB_NAME", "adherencelens"),
        DBSSLMode: getEnv("DB_SSLMODE", "disable"),
    }

    log.Printf("Config loaded: PORT=%s DB_HOST=%s DB_NAME=%s", cfg.Port, cfg.DBHost, cfg.DBName)
    return cfg
}

func getEnv(key, def string) string {
    if val, ok := os.LookupEnv(key); ok {
        return val
    }
    return def
}
