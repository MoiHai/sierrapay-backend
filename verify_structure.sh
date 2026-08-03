#!/bin/bash

# SierraPay Backend Structure Verification Script
# Run from: D:\UTech\SierraPay\backend

echo "========================================="
echo "  SierraPay Backend Structure Verification"
echo "========================================="
echo ""

cd "/d/UTech/SierraPay/backend" || {
    echo "❌ ERROR: Cannot find backend directory"
    exit 1
}

echo "📁 Checking directory structure..."
echo ""

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo "  ✅ $1"
        return 0
    else
        echo "  ❌ MISSING: $1"
        return 1
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo "  ✅ $1"
        return 0
    else
        echo "  ❌ MISSING: $1"
        return 1
    fi
}

# Function to check service directory
check_service_dir() {
    local service=$1
    check_dir "services/$service"
}

# Function to check utils/auth directory
check_utils_auth_file() {
    check_file "utils/auth/$1"
}

echo "═══════════════════════════════════════════"
echo "  MAIN DIRECTORY STRUCTURE"
echo "═══════════════════════════════════════════"
echo ""

check_dir "config"
check_dir "middleware"
check_dir "routes"
check_dir "controllers"
check_dir "services"
check_dir "repositories"
check_dir "validators"
check_dir "utils"
check_dir "socket"
check_dir "uploads"
check_dir "tests"
check_dir "docs"
check_dir "logs"

echo ""
echo "═══════════════════════════════════════════"
echo "  CONFIG FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "config/database.js"
check_file "config/firebase.js"
check_file "config/environment.js"
check_file "config/jwt.js"
check_file "config/sms.js"
check_file "config/mail.js"
check_file "config/payment.js"
check_file "config/constants.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  MIDDLEWARE FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "middleware/authMiddleware.js"
check_file "middleware/adminMiddleware.js"
check_file "middleware/biometricMiddleware.js"
check_file "middleware/errorMiddleware.js"
check_file "middleware/securityMiddleware.js"
check_file "middleware/validationMiddleware.js"
check_file "middleware/rateLimitMiddleware.js"
check_file "middleware/loggerMiddleware.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  ROUTE FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "routes/authRoutes.js"
check_file "routes/userRoutes.js"
check_file "routes/walletRoutes.js"
check_file "routes/transactionRoutes.js"
check_file "routes/paymentRoutes.js"
check_file "routes/qrRoutes.js"
check_file "routes/billRoutes.js"
check_file "routes/notificationRoutes.js"
check_file "routes/kycRoutes.js"
check_file "routes/settingsRoutes.js"
check_file "routes/merchantRoutes.js"
check_file "routes/adminRoutes.js"
check_file "routes/healthRoutes.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  CONTROLLER FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "controllers/authController.js"
check_file "controllers/userController.js"
check_file "controllers/walletController.js"
check_file "controllers/transactionController.js"
check_file "controllers/paymentController.js"
check_file "controllers/qrController.js"
check_file "controllers/billController.js"
check_file "controllers/notificationController.js"
check_file "controllers/kycController.js"
check_file "controllers/settingsController.js"
check_file "controllers/merchantController.js"
check_file "controllers/adminController.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  SERVICE SUBDIRECTORIES & FILES"
echo "═══════════════════════════════════════════"
echo ""

# Auth Services
echo "📂 services/auth/"
check_file "services/auth/authService.js"
check_file "services/auth/loginService.js"
check_file "services/auth/registerService.js"
check_file "services/auth/logoutService.js"
check_file "services/auth/biometricService.js"

# OTP Services
echo ""
echo "📂 services/otp/"
check_file "services/otp/otpService.js"
check_file "services/otp/generateOTP.js"
check_file "services/otp/verifyOTP.js"
check_file "services/otp/smsProvider.js"

# Token Services
echo ""
echo "📂 services/token/"
check_file "services/token/tokenService.js"
check_file "services/token/jwtService.js"
check_file "services/token/refreshTokenService.js"

# Wallet Services
echo ""
echo "📂 services/wallet/"
check_file "services/wallet/walletService.js"
check_file "services/wallet/createWallet.js"
check_file "services/wallet/creditWallet.js"
check_file "services/wallet/debitWallet.js"
check_file "services/wallet/walletHistory.js"

# Payment Services
echo ""
echo "📂 services/payment/"
check_file "services/payment/paymentService.js"
check_file "services/payment/sendMoney.js"
check_file "services/payment/receiveMoney.js"
check_file "services/payment/reverseTransaction.js"
check_file "services/payment/transactionFee.js"

# QR Services
echo ""
echo "📂 services/qr/"
check_file "services/qr/qrService.js"
check_file "services/qr/generateQR.js"
check_file "services/qr/scanQR.js"

# Bill Services
echo ""
echo "📂 services/bill/"
check_file "services/bill/billService.js"
check_file "services/bill/electricityBill.js"
check_file "services/bill/waterBill.js"
check_file "services/bill/internetBill.js"
check_file "services/bill/tvBill.js"

# Notification Services
echo ""
echo "📂 services/notification/"
check_file "services/notification/notificationService.js"
check_file "services/notification/pushNotification.js"
check_file "services/notification/smsNotification.js"
check_file "services/notification/emailNotification.js"

# KYC Services
echo ""
echo "📂 services/kyc/"
check_file "services/kyc/kycService.js"
check_file "services/kyc/uploadDocument.js"
check_file "services/kyc/verifyIdentity.js"
check_file "services/kyc/selfieVerification.js"

# Storage Services
echo ""
echo "📂 services/storage/"
check_file "services/storage/uploadImage.js"
check_file "services/storage/deleteImage.js"
check_file "services/storage/firebaseStorage.js"

# Admin Services
echo ""
echo "📂 services/admin/"
check_file "services/admin/dashboardService.js"
check_file "services/admin/statisticsService.js"
check_file "services/admin/reportService.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  MODEL FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "models/User.js"
check_file "models/Wallet.js"
check_file "models/OTP.js"
check_file "models/Transaction.js"
check_file "models/Notification.js"
check_file "models/BillPayment.js"
check_file "models/QRPayment.js"
check_file "models/Merchant.js"
check_file "models/KYC.js"
check_file "models/Device.js"
check_file "models/Session.js"
check_file "models/Settings.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  REPOSITORY FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "repositories/userRepository.js"
check_file "repositories/walletRepository.js"
check_file "repositories/transactionRepository.js"
check_file "repositories/otpRepository.js"
check_file "repositories/notificationRepository.js"
check_file "repositories/merchantRepository.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  VALIDATOR FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "validators/authValidator.js"
check_file "validators/otpValidator.js"
check_file "validators/walletValidator.js"
check_file "validators/paymentValidator.js"
check_file "validators/transactionValidator.js"
check_file "validators/kycValidator.js"
check_file "validators/userValidator.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  UTILS FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "utils/logger.js"
check_file "utils/formatter.js"
check_file "utils/response.js"
check_file "utils/dateTime.js"
check_file "utils/currency.js"
check_file "utils/helpers.js"

echo ""
echo "📂 utils/auth/"
check_utils_auth_file "phoneFormatter.js"
check_utils_auth_file "generateReference.js"
check_utils_auth_file "generateOTP.js"
check_utils_auth_file "generateWalletNumber.js"
check_utils_auth_file "generateQRCode.js"
check_utils_auth_file "generateTransactionId.js"
check_utils_auth_file "hashGenerator.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  SOCKET FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "socket/socketServer.js"
check_file "socket/notificationSocket.js"
check_file "socket/transactionSocket.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  UPLOAD SUBDIRECTORIES"
echo "═══════════════════════════════════════════"
echo ""

check_dir "uploads/profile"
check_dir "uploads/kyc"
check_dir "uploads/qr"
check_dir "uploads/temp"

echo ""
echo "═══════════════════════════════════════════"
echo "  TEST FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "tests/auth.test.js"
check_file "tests/wallet.test.js"
check_file "tests/payment.test.js"
check_file "tests/transaction.test.js"
check_file "tests/notification.test.js"

echo ""
echo "═══════════════════════════════════════════"
echo "  DOCS FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "docs/API.md"
check_file "docs/POSTMAN_COLLECTION.json"
check_file "docs/FIRESTORE_SCHEMA.md"
check_file "docs/DEPLOYMENT.md"

echo ""
echo "═══════════════════════════════════════════"
echo "  LOG FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "logs/error.log"
check_file "logs/access.log"
check_file "logs/system.log"

echo ""
echo "═══════════════════════════════════════════"
echo "  MAIN FILES"
echo "═══════════════════════════════════════════"
echo ""

check_file "app.js"
check_file "server.js"
check_file "package.json"
check_file "package-lock.json"
check_file ".env"
check_file ".gitignore"

echo ""
echo "========================================="
echo "  Verification Complete!"
echo "========================================="
echo ""

# Count total files and directories
total_dirs=$(find . -type d -not -path "./node_modules*" -not -path "./.git*" | wc -l)
total_files=$(find . -type f -not -path "./node_modules*" -not -path "./.git*" -not -name "*.log" -not -name "*.backup" | wc -l)

echo "📊 Summary:"
echo "   Total Directories: $total_dirs"
echo "   Total Files: $total_files"
echo ""

read -p "Press Enter to exit..."