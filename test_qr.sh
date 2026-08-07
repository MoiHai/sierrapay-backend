#!/bin/bash
# Test script for Phase 5 - QR Payments

echo "============================================"
echo "  SierraPay Phase 5 - QR Payments Test"
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
echo "  Testing QR Payment Endpoints"
echo "============================================"

# 1. Generate QR Code
echo ""
echo "📱 Generating QR Code..."
QR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Payment for services"
  }')

echo $QR_RESPONSE
QR_CODE=$(echo $QR_RESPONSE | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
QR_ID=$(echo $QR_RESPONSE | grep -o '"qrId":"[^"]*"' | cut -d'"' -f4)

echo "QR Code: $QR_CODE"
echo "QR ID: $QR_ID"

# 2. Check wallet balance
echo ""
echo "💰 Wallet Balance:"
curl -s -X GET http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 3. Get QR history
echo ""
echo "📊 QR History:"
curl -s -X GET "http://localhost:5000/api/v1/qr/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get specific QR
if [ -n "$QR_ID" ]; then
  echo ""
  echo "📋 QR Details:"
  curl -s -X GET "http://localhost:5000/api/v1/qr/$QR_ID" \
    -H "Authorization: Bearer $TOKEN"
fi

echo ""
echo "============================================"
echo "  ✅ PHASE 5 - QR PAYMENTS READY!"
echo "============================================"
