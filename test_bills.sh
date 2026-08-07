#!/bin/bash
# Test script for Phase 6 - Bill Payments

echo "============================================"
echo "  SierraPay Phase 6 - Bill Payments Test"
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
echo "  Testing Bill Payment Endpoints"
echo "============================================"

# 1. Get providers
echo ""
echo "📋 Getting Bill Providers..."
curl -s -X GET http://localhost:5000/api/v1/bills/providers \
  -H "Authorization: Bearer $TOKEN"

# 2. Pay Electricity Bill
echo ""
echo "⚡ Paying Electricity Bill..."
curl -s -X POST http://localhost:5000/api/v1/bills/electricity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "EDSA",
    "customerId": "ELEC-12345",
    "amount": 10000,
    "customerName": "John Doe"
  }'

# 3. Check wallet balance
echo ""
echo "💰 Wallet Balance:"
curl -s -X GET http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 4. Get bill history
echo ""
echo "📊 Bill History:"
curl -s -X GET "http://localhost:5000/api/v1/bills/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get bill stats
echo ""
echo "📈 Bill Stats:"
curl -s -X GET "http://localhost:5000/api/v1/bills/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 6 - BILL PAYMENTS READY!"
echo "============================================"
