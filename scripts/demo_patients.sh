#!/usr/bin/env bash
API="http://localhost:8080/api"

echo "1) Low-risk patient (simple once-daily, no complaints)"
PID1=$(
  curl -s -X POST "$API/patients" \
    -H "Content-Type: application/json" \
    -d '{
      "externalId":"",
      "name":"Low Risk Laura",
      "age":58,
      "gender":"F",
      "primaryCondition":"Hypertension"
    }' | jq -r '.id'
)
curl -s -X POST "$API/patients/$PID1/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "source":"clinic",
    "text":"Patient takes lisinopril once daily in the morning. No missed doses reported. No side effects, feels comfortable with regimen."
  }' >/dev/null
curl -s -X POST "$API/patients/$PID1/analyze" | jq .

echo
echo "2) Medium-risk (polypharmacy, no strong negative language)"
PID2=$(
  curl -s -X POST "$API/patients" \
    -H "Content-Type: application/json" \
    -d '{
      "externalId":"",
      "name":"Medium Mike",
      "age":67,
      "gender":"M",
      "primaryCondition":"Type 2 diabetes"
    }' | jq -r '.id'
)
curl -s -X POST "$API/patients/$PID2/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "source":"discharge",
    "text":"On metformin 500mg BID and atorvastatin 20mg daily. Takes insulin at lunch. Sometimes confused by timing but tries to follow instructions."
  }' >/dev/null
curl -s -X POST "$API/patients/$PID2/analyze" | jq .

echo
echo "3) High-risk (multiple meds + night dose + negative phrases)"
PID3=$(
  curl -s -X POST "$API/patients" \
    -H "Content-Type: application/json" \
    -d '{
      "externalId":"",
      "name":"High Risk Hannah",
      "age":72,
      "gender":"F",
      "primaryCondition":"HF + diabetes"
    }' | jq -r '.id'
)
curl -s -X POST "$API/patients/$PID3/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "source":"discharge",
    "text":"Metformin 500mg BID, insulin at dinner, atorvastatin at night and lisinopril in the morning. Patient reports forgetting evening doses several times a week and is tired of injections and side effects."
  }' >/dev/null
curl -s -X POST "$API/patients/$PID3/analyze" | jq .

echo
echo "4) As-needed instructions (confusing, moderate risk)"
PID4=$(
  curl -s -X POST "$API/patients" \
    -H "Content-Type: application/json" \
    -d '{
      "externalId":"",
      "name":"PRN Paula",
      "age":49,
      "gender":"F",
      "primaryCondition":"Migraine"
    }' | jq -r '.id'
)
curl -s -X POST "$API/patients/$PID4/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "source":"clinic",
    "text":"Takes metformin daily and uses pain medication as needed (prn) for headaches. Sometimes unsure when exactly to take the prn medication."
  }' >/dev/null
curl -s -X POST "$API/patients/$PID4/analyze" | jq .

echo
echo "5) Night doses but no negativity (medium risk)"
PID5=$(
  curl -s -X POST "$API/patients" \
    -H "Content-Type: application/json" \
    -d '{
      "externalId":"",
      "name":"Nighttime Nick",
      "age":61,
      "gender":"M",
      "primaryCondition":"Hyperlipidemia"
    }' | jq -r '.id'
)
curl -s -X POST "$API/patients/$PID5/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "source":"portal",
    "text":"Takes atorvastatin at bedtime and metformin 500mg BID. Has not missed many doses but sometimes forgets the bedtime pill when travelling."
  }' >/dev/null
curl -s -X POST "$API/patients/$PID5/analyze" | jq .
