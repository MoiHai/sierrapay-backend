#!/bin/bash
# Test script for QR scanning (requires second user)

echo "============================================"
echo "  SierraPay Phase 5 - QR Scan Test"
echo "============================================"
echo ""

echo "⚠️  This test requires a second user to scan the QR code."
echo "1. First user generates QR code"
echo "2. Second user scans and pays"
echo ""

# First user (Moi Hai) - Generate QR
echo "📱 Generating QR Code as Moi Hai..."
OTP1=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

RESPONSE1=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP1\"}")

TOKEN1=$(echo $RESPONSE1 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Generating QR..."
QR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Test QR payment"
  }')

QR_CODE=$(echo $QR_RESPONSE | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
echo "QR Code: $QR_CODE"

# Second user - Scan QR
echo ""
echo "📱 Scanning QR Code as Second User..."
echo "Please register a second user first (e.g., +23276123456)"
echo "Enter the second user's phone number:"
read PHONE2

if [ -z "$PHONE2" ]; then
  echo "❌ No phone number entered. Using default: +23276123456"
  PHONE2="+23276123456"
fi

echo "Getting OTP for second user..."
OTP2=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE2\", \"purpose\": \"login\"}" | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

RESPONSE2=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE2\", \"code\": \"$OTP2\"}")

TOKEN2=$(echo $RESPONSE2 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Scanning and paying..."
curl -X POST http://localhost:5000/api/v1/qr/scan \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"qrCode\": \"$QR_CODE\"
  }"

echo ""
echo "============================================"
echo "  ✅ QR SCAN TEST COMPLETE!"
echo "============================================"
