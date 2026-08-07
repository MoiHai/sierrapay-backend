#!/bin/bash
# Test script for Phase 7 - Notifications

echo "============================================"
echo "  SierraPay Phase 7 - Notifications Test"
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
echo "  Testing Notification Endpoints"
echo "============================================"

# 1. Get notifications
echo ""
echo "📬 Getting Notifications..."
curl -s -X GET "http://localhost:5000/api/v1/notifications?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get unread count
echo ""
echo "📊 Unread Count..."
curl -s -X GET "http://localhost:5000/api/v1/notifications/unread" \
  -H "Authorization: Bearer $TOKEN"

# 3. Send a notification (in-app only)
echo ""
echo "📨 Sending Notification..."
curl -s -X POST http://localhost:5000/api/v1/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "IKTTbPuZMJomd3TTwT8X",
    "title": "Test Notification",
    "body": "This is a test notification from SierraPay",
    "data": {
      "type": "system",
      "action": "test"
    },
    "channels": ["in_app"]
  }'

# 4. Send a notification with push
echo ""
echo "📨 Sending Notification with Push..."
curl -s -X POST http://localhost:5000/api/v1/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "IKTTbPuZMJomd3TTwT8X",
    "title": "🔔 Push Test",
    "body": "This is a push notification test",
    "data": {
      "type": "system",
      "action": "push_test"
    },
    "channels": ["in_app", "push"]
  }'

# 5. Get updated notifications
echo ""
echo "📬 Updated Notifications..."
curl -s -X GET "http://localhost:5000/api/v1/notifications?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 6. Get updated unread count
echo ""
echo "📊 Updated Unread Count..."
curl -s -X GET "http://localhost:5000/api/v1/notifications/unread" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 7 - NOTIFICATIONS READY!"
echo "============================================"
