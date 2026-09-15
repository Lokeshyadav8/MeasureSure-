export type UserRole = 'BUSINESS_OWNER' | 'INSPECTOR' | 'ADMIN' | 'PUBLIC';

export type ScreenType = 'LOGIN' | 'LANDING' | 'DASHBOARD' | 'INSPECTION_WORKSPACE' | 'PUBLIC_VERIFY' | 'GRIEVANCE_PORTAL' | 'ADMIN_PORTAL';

export interface LoginAuditRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  businessOrDepartment?: string;
  portalName: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
}

export type InstrumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'INSPECTION_SCHEDULED'
  | 'UNDER_INSPECTION'
  | 'PASSED'
  | 'FAILED'
  | 'CERTIFICATE_GENERATED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserEntity {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  businessOrDepartment: string;
  phone: string; // Contact number
  licenseNumber: string;
  passwordHash?: string; // Salted cryptographic hashcode
  salt?: string;
  createdAt?: number;
  syncedToSupabase?: boolean;
  supabaseId?: string;
}

export type PaymentMode =
  | 'UPI_PHONEPE'
  | 'UPI_GPAY'
  | 'UPI_PAYTM'
  | 'UPI_BHIM'
  | 'UPI_AMAZONPAY'
  | 'UPI_CRED'
  | 'UPI_CUSTOM'
  | 'CARD_RUPAY'
  | 'CARD_VISA'
  | 'CARD_MASTERCARD'
  | 'CARD_MAESTRO'
  | 'NETBANKING'
  | 'TREASURY_CHALLAN';

export interface PaymentReceiptEntity {
  receiptNumber: string;
  grnNumber: string;
  transactionId: string;
  bankReferenceNumber: string;
  cinNumber: string;
  instrumentId: string;
  instrumentName: string;
  ownerBusiness: string;
  amount: number;
  statutoryFee: number;
  stampingFee: number;
  portalFee: number;
  paymentMode: PaymentMode;
  paymentModeLabel: string;
  paymentMethodDetails: string;
  paidAt: number;
  treasuryHead: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface InstrumentEntity {
  id: string;
  instrumentId: string;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  capacity: string;
  unitOfMeasurement: string;
  location: string;
  ownerBusiness: string;
  ownerId: string;
  permissibleTolerance: number;
  status: InstrumentStatus;
  riskScore: RiskLevel;
  riskReason: string;
  lastVerificationDate: string;
  nextVerificationDate: string;
  certificateId: string | null;
  qrPayload: string;
  createdAt: number;
  updatedAt: number;
  paymentStatus?: 'PAID' | 'PENDING';
  paymentReceipt?: PaymentReceiptEntity;
  inspectionFee?: number;
}

export interface VerificationRequestEntity {
  id: string;
  requestId: string;
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  ownerId: string;
  businessName: string;
  status: InstrumentStatus;
  submissionDate: string;
  scheduledDate: string;
  assignedInspectorId: string;
  assignedInspectorName: string;
  notes: string;
  inspectionFee: number;
  paymentStatus: string;
}

export interface TestReading {
  id: string;
  standardWeight: number;
  actualReading: number;
  errorPercentage: number;
  toleranceLimit: number;
  passed: boolean;
  notes: string;
}

export interface InspectionEntity {
  id: string;
  inspectionId: string;
  requestId: string;
  instrumentId: string;
  inspectorId: string;
  inspectorName: string;
  inspectionDate: string;
  environmentTempC: number;
  environmentHumidityPercent: number;
  readingsJson: string; // serialized TestReading[]
  isPassed: boolean;
  tamperSealApplied: boolean;
  tamperSealNumber: string;
  aiAnomalyDetected: boolean;
  aiRiskScore: RiskLevel;
  aiDiagnosticNotes: string;
  inspectorNotes: string;
}

export interface CertificateEntity {
  id: string;
  certificateNumber: string;
  inspectionId: string;
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  capacity: string;
  unit: string;
  ownerBusiness: string;
  location: string;
  inspectorName: string;
  standardCode: string;
  verificationDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  qrVerificationUrl: string;
  tamperSealNumber: string;
  issuedAt: number;
}

export interface AuditLogEntity {
  id: string;
  timestamp: number;
  action: string;
  performedBy: string;
  role: UserRole;
  instrumentId: string;
  details: string;
}

export interface OcrExtractionResult {
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  unit: string;
  instrumentType: string;
  permissibleTolerance: number;
  classType: string;
  confidence: number;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  riskScore: RiskLevel;
  confidence: number;
  recommendation: 'PASS' | 'FAIL' | 'CONDITIONAL_PASS';
  explanation: string;
  suggestedActions: string[];
  flags: string[];
}

export interface PredictiveRiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
  recommendedInspectionIntervalDays: number;
  urgency: 'ROUTINE' | 'MONITOR' | 'IMMEDIATE_ACTION';
}

export type GrievanceCategory =
  | 'INSPECTOR_MISCONDUCT'
  | 'INSPECTION_DELAY'
  | 'WEBSITE_TECHNICAL_ISSUE'
  | 'PAYMENT_BILLING_ISSUE'
  | 'SHORT_DELIVERY_MALPRACTICE'
  | 'TAMPERED_SEAL'
  | 'BRIBERY_CORRUPTION'
  | 'OTHER';

export interface GrievanceReportEntity {
  id: string;
  reportId: string;
  timestamp: number;
  reporterName: string;
  reporterContact: string;
  reporterEmail?: string;
  reporterRole?: UserRole | 'CITIZEN';
  establishmentName: string;
  instrumentTypeOrId: string;
  location: string;
  category: GrievanceCategory;
  inspectorNameOrId?: string;
  requestIdOrInstId?: string;
  websiteIssueType?: string;
  issueDescription: string;
  severity: 'ROUTINE' | 'URGENT' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INSPECTOR_DISPATCHED' | 'RESOLVED' | 'REJECTED';
  actionTaken?: string;
  resolutionRemarks?: string;
  resolvedAt?: number;
  resolutionOfficer?: string;
}

