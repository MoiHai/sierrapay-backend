const { db } = require("../../config/firebase");
const { generateToken } = require("../../config/jwt");
const { generateOTP } = require("../../utils/auth/generateOTP");
const { generateWalletNumber } = require("../../utils/auth/generateWalletNumber");
const { generateReference } = require("../../utils/auth/generateReference");

class AuthService {
    // Send OTP to user's phone
    async sendOTP(phone) {
        try {
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            
            console.log(`📱 Generating OTP for ${phone}: ${otp}`);
            
            // Store OTP in Firestore with timeout
            const otpData = {
                phone,
                otp,
                expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
                verified: false,
                createdAt: admin.firestore.Timestamp.now(),
            };
            
            const docRef = await db.collection("otp_verifications").add(otpData);
            console.log(`✅ OTP stored with ID: ${docRef.id}`);
            
            // In production, send SMS here
            // For testing, log the OTP
            console.log(`📱 OTP for ${phone}: ${otp}`);
            
            return { success: true, message: "OTP sent successfully" };
        } catch (error) {
            console.error("❌ Send OTP Error:", error);
            throw new Error(`Failed to send OTP: ${error.message}`);
        }
    }
    
    // Verify OTP and create/authenticate user
    async verifyOTP(phone, otp) {
        try {
            console.log(`🔍 Verifying OTP for ${phone}: ${otp}`);
            
            // Find valid OTP
            const snapshot = await db.collection("otp_verifications")
                .where("phone", "==", phone)
                .where("otp", "==", otp)
                .where("verified", "==", false)
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                throw new Error("Invalid or expired OTP");
            }
            
            const otpDoc = snapshot.docs[0];
            const otpData = otpDoc.data();
            
            // Check if expired
            const now = new Date();
            const expiresAt = otpData.expiresAt.toDate ? otpData.expiresAt.toDate() : new Date(otpData.expiresAt);
            
            if (now > expiresAt) {
                throw new Error("OTP expired");
            }
            
            // Mark as verified
            await otpDoc.ref.update({ verified: true, verifiedAt: admin.firestore.Timestamp.now() });
            
            // Check if user exists
            const userSnapshot = await db.collection("users")
                .where("phone", "==", phone)
                .limit(1)
                .get();
            
            let user;
            let wallet;
            
            if (userSnapshot.empty) {
                // Create new user
                console.log(`👤 Creating new user for ${phone}`);
                const userRef = db.collection("users").doc();
                const userId = userRef.id;
                
                const userData = {
                    id: userId,
                    phone,
                    fullName: "",
                    email: "",
                    createdAt: admin.firestore.Timestamp.now(),
                    updatedAt: admin.firestore.Timestamp.now(),
                    hasBiometric: false,
                    isKycVerified: false,
                    isActive: true,
                };
                
                await userRef.set(userData);
                user = { ...userData, id: userId };
                
                // Create wallet
                console.log(`💰 Creating wallet for user ${userId}`);
                const walletRef = db.collection("wallets").doc();
                const walletNumber = generateWalletNumber();
                
                const walletData = {
                    id: walletRef.id,
                    userId,
                    balance: 0,
                    currency: "SLE",
                    walletNumber: walletNumber,
                    createdAt: admin.firestore.Timestamp.now(),
                    updatedAt: admin.firestore.Timestamp.now(),
                    isActive: true,
                };
                
                await walletRef.set(walletData);
                wallet = { ...walletData, id: walletRef.id };
                
                console.log(`✅ User and wallet created successfully`);
            } else {
                // Existing user
                console.log(`👤 Existing user found for ${phone}`);
                const doc = userSnapshot.docs[0];
                user = doc.data();
                user.id = doc.id;
                
                // Get wallet
                const walletSnapshot = await db.collection("wallets")
                    .where("userId", "==", user.id)
                    .limit(1)
                    .get();
                
                if (!walletSnapshot.empty) {
                    const walletDoc = walletSnapshot.docs[0];
                    wallet = walletDoc.data();
                    wallet.id = walletDoc.id;
                } else {
                    // Create wallet if missing
                    console.log(`💰 Creating wallet for existing user ${user.id}`);
                    const walletRef = db.collection("wallets").doc();
                    const walletNumber = generateWalletNumber();
                    
                    const walletData = {
                        id: walletRef.id,
                        userId: user.id,
                        balance: 0,
                        currency: "SLE",
                        walletNumber: walletNumber,
                        createdAt: admin.firestore.Timestamp.now(),
                        updatedAt: admin.firestore.Timestamp.now(),
                        isActive: true,
                    };
                    
                    await walletRef.set(walletData);
                    wallet = { ...walletData, id: walletRef.id };
                }
            }
            
            // Generate JWT token
            const token = generateToken(user.id, user.phone);
            
            // Return user data (without sensitive info)
            const userData = {
                id: user.id,
                phone: user.phone,
                fullName: user.fullName || "",
                email: user.email || "",
                hasBiometric: user.hasBiometric || false,
                isKycVerified: user.isKycVerified || false,
            };
            
            return {
                token,
                user: userData,
                wallet: wallet ? {
                    id: wallet.id,
                    balance: wallet.balance || 0,
                    currency: wallet.currency || "SLE",
                    walletNumber: wallet.walletNumber,
                } : null,
            };
        } catch (error) {
            console.error("❌ Verify OTP Error:", error);
            throw error;
        }
    }
}

// Need admin for Timestamp
const { admin } = require("../../config/firebase");

module.exports = new AuthService();
