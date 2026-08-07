#!/bin/bash
# Test script for Phase 8 - User Profile

echo "============================================"
echo "  SierraPay Phase 8 - User Profile Test"
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
echo "  Testing Profile Endpoints"
echo "============================================"

# 1. Get profile
echo ""
echo "👤 Getting Profile..."
curl -s -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 2. Update profile
echo ""
echo "✏️ Updating Profile..."
curl -s -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Moi Hai SierraPay",
    "email": "moihai.sierra@gmail.com"
  }'

# 3. Update settings
echo ""
echo "⚙️ Updating Settings..."
curl -s -X PUT http://localhost:5000/api/v1/users/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometricEnabled": true,
    "twoFactorEnabled": false,
    "notificationsEnabled": true
  }'

# 4. Get profile again
echo ""
echo "👤 Updated Profile..."
curl -s -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 5. Get activity
echo ""
echo "📊 User Activity..."
curl -s -X GET "http://localhost:5000/api/v1/users/activity?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 6. Get KYC status
echo ""
echo "🪪 KYC Status..."
curl -s -X GET "http://localhost:5000/api/v1/users/kyc" \
  -H "Authorization: Bearer $TOKEN"

# 7. Get devices
echo ""
echo "📱 Devices..."
curl -s -X GET "http://localhost:5000/api/v1/users/devices" \
  -H "Authorization: Bearer $TOKEN"

# 8. Get stats
echo ""
echo "📊 User Stats..."
curl -s -X GET "http://localhost:5000/api/v1/users/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 8 - USER PROFILE READY!"
echo "============================================"
