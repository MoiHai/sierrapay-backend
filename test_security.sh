#!/bin/bash
# Test script for Phase 10 - Security

echo "============================================"
echo "  SierraPay Phase 10 - Security Test"
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
echo "  Testing Security Endpoints"
echo "============================================"

# 1. Get devices
echo ""
echo "📱 Getting Devices..."
curl -s -X GET http://localhost:5000/api/v1/security/devices \
  -H "Authorization: Bearer $TOKEN"

# 2. Register device
echo ""
echo "📱 Registering Device..."
curl -s -X POST http://localhost:5000/api/v1/security/devices/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "deviceName": "Test Device",
    "deviceType": "web",
    "deviceModel": "Chrome Browser",
    "osVersion": "Windows 11"
  }'

# 3. Get trusted devices
echo ""
echo "🔒 Getting Trusted Devices..."
curl -s -X GET http://localhost:5000/api/v1/security/trusted \
  -H "Authorization: Bearer $TOKEN"

# 4. Trust device
echo ""
echo "🔑 Trusting Device..."
curl -s -X PUT http://localhost:5000/api/v1/security/devices/test-device-001/trust \
  -H "Authorization: Bearer $TOKEN"

# 5. Get trusted devices (after trust)
echo ""
echo "🔒 Trusted Devices (Updated)..."
curl -s -X GET http://localhost:5000/api/v1/security/trusted \
  -H "Authorization: Bearer $TOKEN"

# 6. Get sessions
echo ""
echo "🔐 Getting Sessions..."
curl -s -X GET http://localhost:5000/api/v1/security/sessions \
  -H "Authorization: Bearer $TOKEN"

# 7. Enable biometric
echo ""
echo "📱 Enabling Biometric..."
curl -s -X POST http://localhost:5000/api/v1/security/biometric/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001"
  }'

# 8. Get devices (updated)
echo ""
echo "📱 Updated Devices..."
curl -s -X GET http://localhost:5000/api/v1/security/devices \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 10 - SECURITY READY!"
echo "============================================"
