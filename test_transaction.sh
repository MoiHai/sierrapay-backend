#!/bin/bash
# Test script for Phase 4 - Transactions

echo "============================================"
echo "  SierraPay Phase 4 - Transactions Test"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get OTP
echo "📱 Getting OTP..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23276123456", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo -e "${GREEN}OTP: $OTP${NC}"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23276123456\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Token: $TOKEN${NC}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

# Test endpoints
echo ""
echo "============================================"
echo "  Testing Transaction Endpoints"
echo "============================================"

# 1. Send Money
echo ""
echo -e "${BLUE}💰 Sending Money...${NC}"
SEND_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/transactions/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverPhone": "+23276123456",
    "amount": 1000,
    "description": "Test payment"
  }')
echo $SEND_RESPONSE | jq '.'

# Extract transaction ID
TX_ID=$(echo $SEND_RESPONSE | grep -o '"transactionId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TX_ID" ]; then
  echo -e "${GREEN}✅ Transaction ID: $TX_ID${NC}"
fi

# 2. Get Transaction History
echo ""
echo -e "${BLUE}📊 Getting Transaction History...${NC}"
curl -s -X GET "http://localhost:5000/api/v1/transactions/history?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Get Stats
echo ""
echo -e "${BLUE}📈 Getting Stats...${NC}"
curl -s -X GET http://localhost:5000/api/v1/transactions/stats/summary \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo -e "${GREEN}============================================"
echo -e "  ✅ PHASE 4 - TRANSACTIONS READY!"
echo -e "============================================${NC}"
