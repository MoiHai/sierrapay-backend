#!/bin/bash
# Test script for Phase 9 - KYC

echo "============================================"
echo "  SierraPay Phase 9 - KYC Test"
echo "============================================"
echo ""

# Get OTP for Moi Hai
echo "📱 Getting OTP for Moi Hai..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo "OTP: $OTP"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo ""
echo "============================================"
echo "  Testing KYC Endpoints"
echo "============================================"

# 1. Get KYC status (before submission)
echo ""
echo "📋 KYC Status (Before)..."
curl -s -X GET http://localhost:5000/api/v1/kyc/status \
  -H "Authorization: Bearer $TOKEN"

# 2. Submit KYC application
echo ""
echo "📝 Submitting KYC..."
curl -s -X POST http://localhost:5000/api/v1/kyc/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Moi Hai SierraPay",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "nationality": "Sierra Leonean",
    "countryOfResidence": "Sierra Leone",
    "address": "123 Main Street",
    "city": "Freetown",
    "state": "Western Area",
    "country": "Sierra Leone",
    "idType": "national_id",
    "idNumber": "SL-12345-67890",
    "idIssueDate": "2020-01-01",
    "idExpiryDate": "2030-01-01",
    "idCountry": "Sierra Leone"
  }'

# 3. Upload ID document
echo ""
echo "🪪 Uploading ID..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idType": "national_id"
  }'

# 4. Upload Selfie
echo ""
echo "📸 Uploading Selfie..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/selfie \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Upload Proof of Address
echo ""
echo "📄 Uploading Proof of Address..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/proof \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 6. Get KYC status (after submission)
echo ""
echo "📋 KYC Status (After)..."
curl -s -X GET http://localhost:5000/api/v1/kyc/status \
  -H "Authorization: Bearer $TOKEN"

# 7. Get full KYC details
echo ""
echo "📋 Full KYC Details..."
curl -s -X GET http://localhost:5000/api/v1/kyc \
  -H "Authorization: Bearer $TOKEN"

# 8. Admin: Get all KYC submissions
echo ""
echo "👑 Admin: All KYC Submissions..."
curl -s -X GET "http://localhost:5000/api/v1/kyc/admin/all?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 9. Admin: Get KYC stats
echo ""
echo "👑 Admin: KYC Stats..."
curl -s -X GET "http://localhost:5000/api/v1/kyc/admin/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 9 - KYC READY!"
echo "============================================"
