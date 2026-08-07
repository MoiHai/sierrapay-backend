/**
 * KYC Model - Firestore Schema
 * Collection: kyc
 */
class KYC {
  constructor(data) {
    this.kycId = data.kycId || null;
    this.userId = data.userId || null;
    this.status = data.status || 'pending'; // pending | verified | rejected | requires_review
    this.verificationLevel = data.verificationLevel || 1; // 1: Basic, 2: Enhanced, 3: Full
    
    // Personal Information
    this.fullName = data.fullName || null;
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || null;
    this.nationality = data.nationality || null;
    this.countryOfResidence = data.countryOfResidence || null;
    
    // Address Information
    this.address = data.address || null;
    this.city = data.city || null;
    this.state = data.state || null;
    this.postalCode = data.postalCode || null;
    this.country = data.country || null;
    
    // ID Documents
    this.idType = data.idType || null; // passport | national_id | driver_license
    this.idNumber = data.idNumber || null;
    this.idIssueDate = data.idIssueDate || null;
    this.idExpiryDate = data.idExpiryDate || null;
    this.idCountry = data.idCountry || null;
    
    // Document URLs
    this.idFrontUrl = data.idFrontUrl || null;
    this.idBackUrl = data.idBackUrl || null;
    this.selfieUrl = data.selfieUrl || null;
    this.proofOfAddressUrl = data.proofOfAddressUrl || null;
    
    // Verification Data
    this.verificationData = data.verificationData || {};
    this.verifiedBy = data.verifiedBy || null;
    this.verifiedAt = data.verifiedAt || null;
    this.verificationNotes = data.verificationNotes || null;
    this.rejectionReason = data.rejectionReason || null;
    
    // Metadata
    this.metadata = data.metadata || {};
    this.submittedAt = data.submittedAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  isPending() {
    return this.status === 'pending';
  }

  isVerified() {
    return this.status === 'verified';
  }

  isRejected() {
    return this.status === 'rejected';
  }

  isRequiresReview() {
    return this.status === 'requires_review';
  }

  toFirestore() {
    return {
      userId: this.userId,
      status: this.status,
      verificationLevel: this.verificationLevel,
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      nationality: this.nationality,
      countryOfResidence: this.countryOfResidence,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      idType: this.idType,
      idNumber: this.idNumber,
      idIssueDate: this.idIssueDate,
      idExpiryDate: this.idExpiryDate,
      idCountry: this.idCountry,
      idFrontUrl: this.idFrontUrl,
      idBackUrl: this.idBackUrl,
      selfieUrl: this.selfieUrl,
      proofOfAddressUrl: this.proofOfAddressUrl,
      verificationData: this.verificationData,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      verificationNotes: this.verificationNotes,
      rejectionReason: this.rejectionReason,
      metadata: this.metadata,
      submittedAt: this.submittedAt,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new KYC({ ...data, kycId: doc.id });
  }
}

module.exports = KYC;
