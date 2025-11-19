# backend/Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Pre-copy go.mod for caching
COPY go.mod go.sum ./
RUN go mod download

COPY cmd/server ./cmd/server

WORKDIR /app/cmd/server
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

FROM alpine:3.20

WORKDIR /app
COPY --from=builder /app/cmd/server/server /app/server

ENV PORT=8080

EXPOSE 8080

CMD ["./server"]
