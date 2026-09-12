import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  ScreenType,
  InstrumentEntity,
  VerificationRequestEntity,
  InspectionEntity,
  CertificateEntity,
  AuditLogEntity,
  TestReading,
  AnomalyDetectionResult,
  OcrExtractionResult,
  UserEntity,
  GrievanceReportEntity,
  GrievanceCategory,
  PaymentReceiptEntity
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_INSTRUMENTS,
  INITIAL_REQUESTS,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_GRIEVANCES
} from '../data/seedData';
import { GeminiMetrologyService } from '../services/geminiService';
import confetti from 'canvas-confetti';
import { getPublicVerificationUrl, extractVerificationCode } from '../utils/verification';

interface MetrologyContextType {
  userRole: UserRole;
  currentUser: UserEntity;
  usersList: UserEntity[];
  isAuthenticated: boolean;
  activeScreen: ScreenType;
  selectedTab: 'INSTRUMENTS' | 'REQUESTS' | 'ADMIN' | 'PUBLIC_VERIFY' | 'GRIEVANCES';
  instruments: InstrumentEntity[];
  requests: VerificationRequestEntity[];
  inspections: InspectionEntity[];
  certificates: CertificateEntity[];
  auditLogs: AuditLogEntity[];
  grievances: GrievanceReportEntity[];
  
  // Inspection Workspace
  activeInspectionRequest: VerificationRequestEntity | null;
  activeInspectionInstrument: InstrumentEntity | null;
  testReadings: TestReading[];
  aiAnomalyResult: AnomalyDetectionResult | null;
  isAiAnalyzing: boolean;

  // Selected details
  selectedInstrument: InstrumentEntity | null;
  selectedCertificate: CertificateEntity | null;
  showCertificateModal: boolean;
  showRegisterModal: boolean;

  // Payment Gateway & Receipts
  activePaymentInstrument: InstrumentEntity | null;
  showPaymentModal: boolean;
  activeReceiptToView: PaymentReceiptEntity | null;
  showReceiptModal: boolean;
  openPaymentModalForInstrument: (inst: InstrumentEntity) => void;
  closePaymentModal: () => void;
  openReceiptModal: (receipt: PaymentReceiptEntity) => void;
  closeReceiptModal: () => void;
  processInstrumentPayment: (receipt: PaymentReceiptEntity) => void;

  // Scanned Certificate Photo Viewer (Dedicated photo viewer for scanned certificates with QR removed)
  scannedCertificateForViewer: CertificateEntity | null;
  showScannedPhotoViewer: boolean;
  openScannedPhotoViewer: (cert: CertificateEntity) => void;
  closeScannedPhotoViewer: () => void;

  // Grievance / Complaint Redressal Modal
  showGrievanceModal: boolean;
  initialGrievanceCategory: GrievanceCategory;
  grievanceTargetContext?: {
    inspectorNameOrId?: string;
    requestIdOrInstId?: string;
    establishmentName?: string;
  };
  openGrievanceModal: (
    category?: GrievanceCategory,
    context?: { inspectorNameOrId?: string; requestIdOrInstId?: string; establishmentName?: string }
  ) => void;
  closeGrievanceModal: () => void;

  // OCR
  ocrResult: OcrExtractionResult | null;
  isOcrScanning: boolean;

  // Search & Filters
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  onlyMyBusinessInstruments: boolean;

  // Public Verify
  publicSearchQuery: string;
  publicSearchResult: CertificateEntity | null;
  publicHasSearched: boolean;

  // Actions
  login: (role: UserRole, emailOrId?: string, passwordOrPin?: string, customName?: string, customDept?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  registerUser: (userData: Omit<UserEntity, 'userId'>) => Promise<{ success: boolean; message?: string }>;
  switchUserAccount: (userId: string) => void;
  setUserRole: (role: UserRole) => void;
  setActiveScreen: (screen: ScreenType) => void;
  setSelectedTab: (tab: 'INSTRUMENTS' | 'REQUESTS' | 'ADMIN' | 'PUBLIC_VERIFY' | 'GRIEVANCES') => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (category: string) => void;
  setOnlyMyBusinessInstruments: (val: boolean) => void;
  setSelectedInstrument: (inst: InstrumentEntity | null) => void;
  setSelectedCertificate: (cert: CertificateEntity | null) => void;
  setShowCertificateModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
  
  requestVerification: (instrument: InstrumentEntity) => void;
  registerInstrument: (data: {
    name: string;
    type: string;
    category: string;
    manufacturer: string;
    modelNumber: string;
    serialNumber: string;
    capacity: string;
    unitOfMeasurement: string;
    location: string;
    permissibleTolerance: number;
  }) => InstrumentEntity;

  openInspectionWorkspace: (request: VerificationRequestEntity) => void;
  addTestReading: (reading: Omit<TestReading, 'id' | 'errorPercentage' | 'passed' | 'toleranceLimit'> & { toleranceLimit?: number }) => void;
  updateTestReading: (id: string, actualReading: number) => void;
  removeTestReading: (id: string) => void;
  runAiAnomalyAnalysis: () => Promise<void>;
  completeInspection: (params: {
    isPassed: boolean;
    inspectorNotes: string;
    tamperSealNumber: string;
    environmentTempC?: number;
    environmentHumidityPercent?: number;
  }) => Promise<void>;
  
  submitGrievanceReport: (data: Partial<GrievanceReportEntity> & {
    reporterName: string;
    reporterContact: string;
    issueDescription: string;
    category: GrievanceCategory;
    establishmentName?: string;
    location?: string;
  }) => GrievanceReportEntity;
  resolveGrievance: (id: string, newStatus: GrievanceReportEntity['status'], remarks?: string) => void;
  runAiOcrScan: () => Promise<void>;
  searchPublicCertificate: (query: string) => void;
  runDemoFlow: () => Promise<void>;
  resetData: () => void;
}

const MetrologyContext = createContext<MetrologyContextType | undefined>(undefined);

const STORAGE_KEY = 'LEGAL_METROLOGY_STATE_V1';

export const MetrologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return null;
  };

  const initialData = loadSaved();

  const [usersList, setUsersList] = useState<UserEntity[]>(initialData?.usersList || INITIAL_USERS);
  const [userRole, setUserRoleState] = useState<UserRole>(initialData?.userRole || 'BUSINESS_OWNER');
  const [currentUser, setCurrentUser] = useState<UserEntity>(
    initialData?.currentUser || INITIAL_USERS.find(u => u.role === (initialData?.userRole || 'BUSINESS_OWNER')) || INITIAL_USERS[0]
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialData?.isAuthenticated !== undefined ? initialData.isAuthenticated : false
  );

  const getInitialTab = (role: UserRole): 'INSTRUMENTS' | 'REQUESTS' | 'ADMIN' | 'PUBLIC_VERIFY' | 'GRIEVANCES' => {
    if (role === 'PUBLIC') return 'PUBLIC_VERIFY';
    if (role === 'ADMIN') return 'ADMIN';
    if (role === 'INSPECTOR') return 'REQUESTS';
    return 'INSTRUMENTS';
  };

  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    initialData?.isAuthenticated ? (initialData.activeScreen || 'DASHBOARD') : 'LOGIN'
  );
  const [selectedTab, setSelectedTab] = useState<'INSTRUMENTS' | 'REQUESTS' | 'ADMIN' | 'PUBLIC_VERIFY' | 'GRIEVANCES'>(
    initialData?.selectedTab || getInitialTab(initialData?.userRole || 'BUSINESS_OWNER')
  );

  const [instruments, setInstruments] = useState<InstrumentEntity[]>(initialData?.instruments || INITIAL_INSTRUMENTS);
  const [requests, setRequests] = useState<VerificationRequestEntity[]>(initialData?.requests || INITIAL_REQUESTS);
  const [inspections, setInspections] = useState<InspectionEntity[]>(initialData?.inspections || []);
  const [certificates, setCertificates] = useState<CertificateEntity[]>(initialData?.certificates || INITIAL_CERTIFICATES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>(initialData?.auditLogs || INITIAL_AUDIT_LOGS);
  const [grievances, setGrievances] = useState<GrievanceReportEntity[]>(initialData?.grievances || INITIAL_GRIEVANCES);

  // Modals & Active Workspace state
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentEntity | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateEntity | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // Payment Gateway & Receipts
  const [activePaymentInstrument, setActivePaymentInstrument] = useState<InstrumentEntity | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [activeReceiptToView, setActiveReceiptToView] = useState<PaymentReceiptEntity | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const openPaymentModalForInstrument = useCallback((inst: InstrumentEntity) => {
    setActivePaymentInstrument(inst);
    setShowPaymentModal(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
    setActivePaymentInstrument(null);
  }, []);

  const openReceiptModal = useCallback((receipt: PaymentReceiptEntity) => {
    setActiveReceiptToView(receipt);
    setShowReceiptModal(true);
  }, []);

  const closeReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    setActiveReceiptToView(null);
  }, []);

  // Scanned Certificate Photo Viewer State (Photo viewer for scanned certificate with QR code removed)
  const [scannedCertificateForViewer, setScannedCertificateForViewer] = useState<CertificateEntity | null>(null);
  const [showScannedPhotoViewer, setShowScannedPhotoViewer] = useState<boolean>(false);

  const openScannedPhotoViewer = useCallback((cert: CertificateEntity) => {
    setScannedCertificateForViewer(cert);
    setShowScannedPhotoViewer(true);
  }, []);

  const closeScannedPhotoViewer = useCallback(() => {
    setShowScannedPhotoViewer(false);
    setScannedCertificateForViewer(null);
  }, []);

  // Grievance Modal State
  const [showGrievanceModal, setShowGrievanceModal] = useState<boolean>(false);
  const [initialGrievanceCategory, setInitialGrievanceCategory] = useState<GrievanceCategory>('INSPECTOR_MISCONDUCT');
  const [grievanceTargetContext, setGrievanceTargetContext] = useState<{
    inspectorNameOrId?: string;
    requestIdOrInstId?: string;
    establishmentName?: string;
  } | undefined>(undefined);

  const openGrievanceModal = useCallback((
    category?: GrievanceCategory,
    context?: { inspectorNameOrId?: string; requestIdOrInstId?: string; establishmentName?: string }
  ) => {
    if (category) setInitialGrievanceCategory(category);
    setGrievanceTargetContext(context);
    setShowGrievanceModal(true);
  }, []);

  const closeGrievanceModal = useCallback(() => {
    setShowGrievanceModal(false);
    setGrievanceTargetContext(undefined);
  }, []);

  const [activeInspectionRequest, setActiveInspectionRequest] = useState<VerificationRequestEntity | null>(null);
  const [testReadings, setTestReadings] = useState<TestReading[]>([]);
  const [aiAnomalyResult, setAiAnomalyResult] = useState<AnomalyDetectionResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [onlyMyBusinessInstruments, setOnlyMyBusinessInstruments] = useState<boolean>(false);

  // Public Search
  const [publicSearchQuery, setPublicSearchQuery] = useState<string>('');
  const [publicSearchResult, setPublicSearchResult] = useState<CertificateEntity | null>(null);
  const [publicHasSearched, setPublicHasSearched] = useState<boolean>(false);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        usersList,
        userRole,
        currentUser,
        isAuthenticated,
        activeScreen,
        selectedTab,
        instruments,
        requests,
        inspections,
        certificates,
        auditLogs,
        grievances
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [usersList, userRole, currentUser, isAuthenticated, activeScreen, selectedTab, instruments, requests, inspections, certificates, auditLogs, grievances]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    const matchingUser = usersList.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role) || usersList[0];
    if (matchingUser) {
      setCurrentUser(matchingUser);
    }
    if (role === 'PUBLIC') {
      setSelectedTab('PUBLIC_VERIFY');
    } else if (role === 'ADMIN') {
      setSelectedTab('ADMIN');
    } else if (role === 'INSPECTOR') {
      setSelectedTab('REQUESTS');
    } else {
      setSelectedTab('INSTRUMENTS');
    }
  };

  const addAuditLog = useCallback((action: string, instrumentId: string, details: string) => {
    const newLog: AuditLogEntity = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
      action,
      performedBy: currentUser.name,
      role: userRole,
      instrumentId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser.name, userRole]);

  // Login handler
  const login = useCallback(async (
    role: UserRole,
    emailOrId?: string,
    _passwordOrPin?: string,
    customName?: string,
    customDept?: string
  ): Promise<{ success: boolean; message?: string }> => {
    let matchedUser = usersList.find(u =>
      u.role === role && (
        !emailOrId ||
        u.email.toLowerCase() === emailOrId.toLowerCase() ||
        u.userId.toLowerCase() === emailOrId.toLowerCase() ||
        u.licenseNumber.toLowerCase() === emailOrId.toLowerCase()
      )
    );

    if (!matchedUser) {
      matchedUser = usersList.find(u => u.role === role);
    }

    if (!matchedUser) {
      const newUserId = `USR-${role.substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
      matchedUser = {
        userId: newUserId,
        name: customName || (role === 'BUSINESS_OWNER' ? 'Lokesh Yadav' : role === 'INSPECTOR' ? 'Officer Ramakrishna' : role === 'ADMIN' ? 'Chief Inspector Pavan' : 'Rajesh Sharma (Citizen)'),
        email: emailOrId || `${role.toLowerCase()}@metrology.gov.in`,
        role: role,
        businessOrDepartment: customDept || (role === 'BUSINESS_OWNER' ? 'Apex Logistics & Freight Hub' : role === 'INSPECTOR' ? 'Legal Metrology Directorate - Zone 1' : role === 'ADMIN' ? 'National Metrological Regulatory Board' : 'Public Verification Portal'),
        phone: '+91 98450 12345',
        licenseNumber: `LM-${role.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setUsersList(prev => [...prev, matchedUser!]);
    }

    setCurrentUser(matchedUser);
    setUserRoleState(role);
    setIsAuthenticated(true);
    setActiveScreen('DASHBOARD');

    if (role === 'PUBLIC') {
      setSelectedTab('PUBLIC_VERIFY');
    } else if (role === 'ADMIN') {
      setSelectedTab('ADMIN');
    } else if (role === 'INSPECTOR') {
      setSelectedTab('REQUESTS');
    } else {
      setSelectedTab('INSTRUMENTS');
    }

    const newLog: AuditLogEntity = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
      action: 'USER_LOGIN',
      performedBy: matchedUser.name,
      role: role,
      instrumentId: 'PORTAL-AUTH',
      details: `${matchedUser.name} authenticated successfully as ${role} (${matchedUser.businessOrDepartment}).`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, [usersList]);

  // Logout handler
  const logout = useCallback(() => {
    const newLog: AuditLogEntity = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
      action: 'USER_LOGOUT',
      performedBy: currentUser.name,
      role: userRole,
      instrumentId: 'PORTAL-AUTH',
      details: `${currentUser.name} signed out of system.`
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setIsAuthenticated(false);
    setActiveScreen('LOGIN');
  }, [currentUser.name, userRole]);

  // Register User
  const registerUser = useCallback(async (userData: Omit<UserEntity, 'userId'>): Promise<{ success: boolean; message?: string }> => {
    const prefix = userData.role === 'BUSINESS_OWNER' ? 'BIZ' : userData.role === 'INSPECTOR' ? 'INS' : userData.role === 'ADMIN' ? 'ADM' : 'PUB';
    const newUserId = `USR-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserEntity = {
      ...userData,
      userId: newUserId
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setUserRoleState(userData.role);
    setIsAuthenticated(true);
    setActiveScreen('DASHBOARD');

    if (userData.role === 'PUBLIC') {
      setSelectedTab('PUBLIC_VERIFY');
    } else if (userData.role === 'ADMIN') {
      setSelectedTab('ADMIN');
    } else if (userData.role === 'INSPECTOR') {
      setSelectedTab('REQUESTS');
    } else {
      setSelectedTab('INSTRUMENTS');
    }

    const newLog: AuditLogEntity = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
      action: 'USER_REGISTERED',
      performedBy: newUser.name,
      role: newUser.role,
      instrumentId: 'REGISTRY',
      details: `New account registered for ${newUser.name} (${newUser.businessOrDepartment}). License: ${newUser.licenseNumber}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  // Switch Account
  const switchUserAccount = useCallback((userId: string) => {
    const user = usersList.find(u => u.userId === userId);
    if (user) {
      setCurrentUser(user);
      setUserRoleState(user.role);
      setIsAuthenticated(true);
      if (user.role === 'PUBLIC') {
        setSelectedTab('PUBLIC_VERIFY');
      } else if (user.role === 'ADMIN') {
        setSelectedTab('ADMIN');
      } else if (user.role === 'INSPECTOR') {
        setSelectedTab('REQUESTS');
      } else {
        setSelectedTab('INSTRUMENTS');
      }
    }
  }, [usersList]);

  // Submit Grievance
  const submitGrievanceReport = useCallback((data: Partial<GrievanceReportEntity> & {
    reporterName: string;
    reporterContact: string;
    issueDescription: string;
    category: GrievanceCategory;
    establishmentName?: string;
    location?: string;
  }): GrievanceReportEntity => {
    const grvId = data.reportId || `DOCA-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGrv: GrievanceReportEntity = {
      id: data.id || 'grv-' + Date.now(),
      reportId: grvId,
      timestamp: data.timestamp || Date.now(),
      reporterName: data.reporterName,
      reporterContact: data.reporterContact,
      reporterEmail: data.reporterEmail,
      reporterRole: data.reporterRole || userRole || 'CITIZEN',
      establishmentName: data.establishmentName || (data.category === 'WEBSITE_TECHNICAL_ISSUE' ? 'GovVerify Online Portal' : 'Commercial Operating Unit'),
      instrumentTypeOrId: data.instrumentTypeOrId || (data.category === 'WEBSITE_TECHNICAL_ISSUE' ? 'Portal Infrastructure' : 'Commercial Measuring Device'),
      location: data.location || 'Jurisdictional District Zone',
      category: data.category,
      inspectorNameOrId: data.inspectorNameOrId,
      requestIdOrInstId: data.requestIdOrInstId,
      websiteIssueType: data.websiteIssueType,
      issueDescription: data.issueDescription,
      severity: data.severity || 'URGENT',
      status: 'SUBMITTED'
    };
    setGrievances(prev => [newGrv, ...prev]);

    // Check if matched instrument
    if (newGrv.instrumentTypeOrId || newGrv.establishmentName) {
      setInstruments(prev => prev.map(inst => {
        if (
          (newGrv.instrumentTypeOrId && inst.instrumentId.toLowerCase().includes(newGrv.instrumentTypeOrId.toLowerCase())) ||
          (newGrv.establishmentName && inst.ownerBusiness.toLowerCase().includes(newGrv.establishmentName.toLowerCase()))
        ) {
          return {
            ...inst,
            riskScore: 'HIGH',
            riskReason: `Statutory Grievance ${grvId} lodged: ${newGrv.issueDescription.slice(0, 80)}...`
          };
        }
        return inst;
      }));
    }

    addAuditLog(
      'GRIEVANCE_LODGED',
      newGrv.requestIdOrInstId || newGrv.inspectorNameOrId || newGrv.instrumentTypeOrId || 'CITIZEN-GRIEVANCE',
      `[${newGrv.category}] Grievance ${grvId} filed by ${newGrv.reporterName} (${newGrv.reporterContact}). Target: ${newGrv.inspectorNameOrId || newGrv.establishmentName || 'Portal'}. Severity: ${newGrv.severity}.`
    );

    return newGrv;
  }, [addAuditLog, userRole]);

  // Resolve Grievance
  const resolveGrievance = useCallback((id: string, newStatus: GrievanceReportEntity['status'], remarks?: string) => {
    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status: newStatus,
          actionTaken: remarks || (
            newStatus === 'UNDER_REVIEW'
              ? 'Transferred to Directorate Vigilance Cell for factual inquiry.'
              : newStatus === 'INSPECTOR_DISPATCHED'
              ? 'Senior Inspector dispatched for spot investigation and physical verification.'
              : newStatus === 'RESOLVED'
              ? 'Matter investigated, necessary statutory corrections & seal verification executed.'
              : g.actionTaken
          ),
          resolvedAt: newStatus === 'RESOLVED' ? Date.now() : g.resolvedAt,
          resolutionOfficer: newStatus === 'RESOLVED' ? (currentUser.name || 'Chief Inspector Pavan') : g.resolutionOfficer
        };
      }
      return g;
    }));
    addAuditLog('GRIEVANCE_UPDATED', id, `Grievance report ${id} status updated to ${newStatus}.${remarks ? ` Note: ${remarks}` : ''}`);
  }, [addAuditLog, currentUser.name]);

  // Business Owner: Request Verification
  const requestVerification = useCallback((instrument: InstrumentEntity) => {
    const reqId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: VerificationRequestEntity = {
      id: 'req-' + Date.now(),
      requestId: reqId,
      instrumentId: instrument.instrumentId,
      instrumentName: instrument.name,
      instrumentType: instrument.type,
      ownerId: currentUser.userId,
      businessName: instrument.ownerBusiness || currentUser.businessOrDepartment,
      status: 'SUBMITTED',
      submissionDate: new Date().toISOString().split('T')[0],
      scheduledDate: 'Pending Assignment',
      assignedInspectorId: '',
      assignedInspectorName: 'Unassigned',
      notes: `Statutory verification requested for ${instrument.name}. Permissible tolerance: ±${(instrument.permissibleTolerance * 100).toFixed(2)}%.`,
      inspectionFee: 250.0,
      paymentStatus: 'PAID'
    };

    setRequests(prev => [newReq, ...prev]);
    setInstruments(prev => prev.map(inst =>
      inst.id === instrument.id ? { ...inst, status: 'SUBMITTED' } : inst
    ));

    addAuditLog('VERIFICATION_REQUESTED', instrument.instrumentId, `Verification request ${reqId} created by ${currentUser.name}.`);
  }, [addAuditLog, currentUser.businessOrDepartment, currentUser.name, currentUser.userId]);

  // Payment Handler
  const processInstrumentPayment = useCallback((receipt: PaymentReceiptEntity) => {
    const now = Date.now();
    // Update instrument to SUBMITTED, paymentStatus to PAID, attach receipt
    setInstruments(prev =>
      prev.map(inst =>
        inst.instrumentId === receipt.instrumentId
          ? {
              ...inst,
              status: 'SUBMITTED',
              paymentStatus: 'PAID',
              paymentReceipt: receipt,
              updatedAt: now
            }
          : inst
      )
    );

    // Create or update Verification Request
    const reqId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: VerificationRequestEntity = {
      id: 'req-' + now,
      requestId: reqId,
      instrumentId: receipt.instrumentId,
      instrumentName: receipt.instrumentName,
      instrumentType: 'Measuring Instrument',
      ownerId: currentUser.userId,
      businessName: receipt.ownerBusiness,
      status: 'SUBMITTED',
      submissionDate: new Date().toISOString().split('T')[0],
      scheduledDate: 'Pending Inspector Allocation',
      assignedInspectorId: '',
      assignedInspectorName: 'Unassigned',
      notes: `Statutory verification requested. Payment of ₹${receipt.amount} realized via ${receipt.paymentModeLabel} (GRN: ${receipt.grnNumber}).`,
      inspectionFee: receipt.amount,
      paymentStatus: 'PAID'
    };

    setRequests(prev => {
      const exists = prev.find(r => r.instrumentId === receipt.instrumentId);
      if (exists) {
        return prev.map(r => r.instrumentId === receipt.instrumentId ? { ...r, status: 'SUBMITTED', paymentStatus: 'PAID', notes: newReq.notes } : r);
      }
      return [newReq, ...prev];
    });

    addAuditLog(
      'FEE_PAYMENT_SUCCESS',
      receipt.instrumentId,
      `Statutory fee of ₹${receipt.amount} paid via ${receipt.paymentModeLabel} (GRN: ${receipt.grnNumber}). Instrument submitted for field inspection.`
    );
  }, [addAuditLog, currentUser.userId]);

  // Business Owner: Register new Instrument
  const registerInstrument = useCallback((data: {
    name: string;
    type: string;
    category: string;
    manufacturer: string;
    modelNumber: string;
    serialNumber: string;
    capacity: string;
    unitOfMeasurement: string;
    location: string;
    permissibleTolerance: number;
  }): InstrumentEntity => {
    const instId = `INST-${data.type.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let inspectionFee = 950;
    if (data.category === 'Industrial') inspectionFee = 1850;
    else if (data.category === 'Petroleum') inspectionFee = 1450;
    else if (data.category === 'Laboratory') inspectionFee = 1250;

    const newInst: InstrumentEntity = {
      id: 'inst-' + Date.now(),
      instrumentId: instId,
      name: data.name,
      type: data.type,
      category: data.category,
      manufacturer: data.manufacturer,
      modelNumber: data.modelNumber,
      serialNumber: data.serialNumber,
      capacity: data.capacity,
      unitOfMeasurement: data.unitOfMeasurement,
      location: data.location,
      ownerBusiness: currentUser.businessOrDepartment,
      ownerId: currentUser.userId,
      permissibleTolerance: data.permissibleTolerance,
      status: 'DRAFT',
      paymentStatus: 'PENDING',
      inspectionFee,
      riskScore: 'LOW',
      riskReason: 'Newly registered instrument. Statutory fee payment and initial verification pending.',
      lastVerificationDate: 'None',
      nextVerificationDate: 'Pending Initial Verification',
      certificateId: null,
      qrPayload: instId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setInstruments(prev => [newInst, ...prev]);
    addAuditLog('INSTRUMENT_REGISTERED', instId, `Registered ${data.name} (${instId}) in legal metrology directory.`);

    // Automatically trigger payment modal for the newly registered instrument!
    setActivePaymentInstrument(newInst);
    setShowPaymentModal(true);

    return newInst;
  }, [addAuditLog, currentUser.businessOrDepartment, currentUser.userId]);

  // Inspector: Open workspace
  const openInspectionWorkspace = useCallback((request: VerificationRequestEntity) => {
    const instrument = instruments.find(i => i.instrumentId === request.instrumentId);
    setActiveInspectionRequest(request);

    // Populate initial default calibration test points based on instrument capacity
    const capNum = parseFloat(instrument?.capacity || '50') || 50;
    const tol = instrument?.permissibleTolerance || 0.05;

    const points = [0.1, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
      const standard = Math.round(capNum * frac * 100) / 100;
      // Normal slight reading variation (within ±0.01%)
      const variation = (Math.random() * 0.0004 - 0.0002) * standard;
      const actual = Math.round((standard + variation) * 1000) / 1000;
      const errPct = standard > 0 ? (actual - standard) / standard : 0;
      return {
        id: 'reading-' + (idx + 1),
        standardWeight: standard,
        actualReading: actual,
        errorPercentage: errPct,
        toleranceLimit: tol,
        passed: Math.abs(errPct) <= tol,
        notes: `Test Point ${idx + 1} (${Math.round(frac * 100)}% capacity)`
      };
    });

    setTestReadings(points);
    setAiAnomalyResult(null);
    setActiveScreen('INSPECTION_WORKSPACE');

    // Update request status to UNDER_INSPECTION
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'UNDER_INSPECTION' } : r));
    setInstruments(prev => prev.map(i => i.instrumentId === request.instrumentId ? { ...i, status: 'UNDER_INSPECTION' } : i));
    addAuditLog('INSPECTION_STARTED', request.instrumentId, `Officer ${currentUser.name} initiated calibration testing for ${request.requestId}.`);
  }, [addAuditLog, currentUser.name, instruments]);

  const activeInspectionInstrument = activeInspectionRequest
    ? instruments.find(i => i.instrumentId === activeInspectionRequest.instrumentId) || null
    : null;

  // Add Test Reading
  const addTestReading = useCallback((reading: Omit<TestReading, 'id' | 'errorPercentage' | 'passed' | 'toleranceLimit'> & { toleranceLimit?: number }) => {
    const tol = reading.toleranceLimit || activeInspectionInstrument?.permissibleTolerance || 0.05;
    const errPct = reading.standardWeight > 0 ? (reading.actualReading - reading.standardWeight) / reading.standardWeight : 0;
    const newReading: TestReading = {
      ...reading,
      id: 'reading-' + Date.now(),
      errorPercentage: errPct,
      toleranceLimit: tol,
      passed: Math.abs(errPct) <= tol
    };
    setTestReadings(prev => [...prev, newReading]);
  }, [activeInspectionInstrument]);

  // Update Test Reading
  const updateTestReading = useCallback((id: string, actualReading: number) => {
    setTestReadings(prev => prev.map(r => {
      if (r.id === id) {
        const errPct = r.standardWeight > 0 ? (actualReading - r.standardWeight) / r.standardWeight : 0;
        return {
          ...r,
          actualReading,
          errorPercentage: errPct,
          passed: Math.abs(errPct) <= r.toleranceLimit
        };
      }
      return r;
    }));
  }, []);

  const removeTestReading = useCallback((id: string) => {
    setTestReadings(prev => prev.filter(r => r.id !== id));
  }, []);

  // Run AI Anomaly Analysis
  const runAiAnomalyAnalysis = useCallback(async () => {
    if (!activeInspectionInstrument) return;
    setIsAiAnalyzing(true);
    try {
      const result = await GeminiMetrologyService.analyzeInspection({
        instrumentName: activeInspectionInstrument.name,
        instrumentType: activeInspectionInstrument.type,
        capacity: activeInspectionInstrument.capacity,
        unit: activeInspectionInstrument.unitOfMeasurement,
        tolerancePercent: activeInspectionInstrument.permissibleTolerance,
        readings: testReadings
      });
      setAiAnomalyResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  }, [activeInspectionInstrument, testReadings]);

  // Complete Inspection and issue certificate
  const completeInspection = useCallback(async (params: {
    isPassed: boolean;
    inspectorNotes: string;
    tamperSealNumber: string;
    environmentTempC?: number;
    environmentHumidityPercent?: number;
  }) => {
    if (!activeInspectionRequest || !activeInspectionInstrument) return;

    const inspectionId = `INSP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInspection: InspectionEntity = {
      id: 'insp-' + Date.now(),
      inspectionId,
      requestId: activeInspectionRequest.requestId,
      instrumentId: activeInspectionInstrument.instrumentId,
      inspectorId: currentUser.userId,
      inspectorName: currentUser.name,
      inspectionDate: new Date().toISOString().split('T')[0],
      environmentTempC: params.environmentTempC || 21.5,
      environmentHumidityPercent: params.environmentHumidityPercent || 48,
      readingsJson: JSON.stringify(testReadings),
      isPassed: params.isPassed,
      tamperSealApplied: params.isPassed,
      tamperSealNumber: params.tamperSealNumber || `SEAL-2026-NLM-${Math.floor(10000 + Math.random() * 90000)}`,
      aiAnomalyDetected: aiAnomalyResult?.isAnomaly || false,
      aiRiskScore: aiAnomalyResult?.riskScore || (params.isPassed ? 'LOW' : 'HIGH'),
      aiDiagnosticNotes: aiAnomalyResult?.explanation || (params.isPassed ? 'Readings verified within statutory tolerances.' : 'Tolerance exceeded.'),
      inspectorNotes: params.inspectorNotes
    };

    setInspections(prev => [newInspection, ...prev]);

    if (params.isPassed) {
      // Generate Digital Certificate
      const certNumber = `CERT-2026-NLM-${Math.floor(1000 + Math.random() * 9000)}`;
      const validUntil = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

      const newCert: CertificateEntity = {
        id: 'cert-' + Date.now(),
        certificateNumber: certNumber,
        inspectionId,
        instrumentId: activeInspectionInstrument.instrumentId,
        instrumentName: activeInspectionInstrument.name,
        instrumentType: activeInspectionInstrument.type,
        manufacturer: activeInspectionInstrument.manufacturer,
        modelNumber: activeInspectionInstrument.modelNumber,
        serialNumber: activeInspectionInstrument.serialNumber,
        capacity: activeInspectionInstrument.capacity,
        unit: activeInspectionInstrument.unitOfMeasurement,
        ownerBusiness: activeInspectionInstrument.ownerBusiness,
        location: activeInspectionInstrument.location,
        inspectorName: `${currentUser.name} (${currentUser.licenseNumber})`,
        standardCode: 'ISO/IEC 17025 • OIML R76-1 Statutory Legal Metrology',
        verificationDate: new Date().toISOString().split('T')[0],
        validUntil,
        status: 'ACTIVE',
        qrVerificationUrl: getPublicVerificationUrl(certNumber),
        tamperSealNumber: newInspection.tamperSealNumber,
        issuedAt: Date.now()
      };

      setCertificates(prev => [newCert, ...prev]);

      // Update instrument status
      setInstruments(prev => prev.map(inst =>
        inst.instrumentId === activeInspectionInstrument.instrumentId
          ? {
              ...inst,
              status: 'CERTIFICATE_GENERATED',
              riskScore: 'LOW',
              riskReason: 'Annual statutory verification current. Tamper holographic seal applied.',
              lastVerificationDate: newCert.verificationDate,
              nextVerificationDate: newCert.validUntil,
              certificateId: certNumber,
              qrPayload: newCert.qrVerificationUrl
            }
          : inst
      ));

      // Update request status
      setRequests(prev => prev.map(r =>
        r.id === activeInspectionRequest.id ? { ...r, status: 'CERTIFICATE_GENERATED' } : r
      ));

      addAuditLog('CERTIFICATE_ISSUED', activeInspectionInstrument.instrumentId, `Certificate ${certNumber} generated for ${activeInspectionInstrument.name}.`);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // no-op
      }

      setSelectedCertificate(newCert);
      setShowCertificateModal(true);
    } else {
      // Mark Failed
      setInstruments(prev => prev.map(inst =>
        inst.instrumentId === activeInspectionInstrument.instrumentId
          ? {
              ...inst,
              status: 'FAILED',
              riskScore: 'HIGH',
              riskReason: `Failed statutory tolerance limit test. Error observed during calibration.`,
              nextVerificationDate: 'Failed - Recalibration Required'
            }
          : inst
      ));

      setRequests(prev => prev.map(r =>
        r.id === activeInspectionRequest.id ? { ...r, status: 'FAILED' } : r
      ));

      addAuditLog('INSPECTION_FAILED', activeInspectionInstrument.instrumentId, `Inspection failed tolerance checks. Re-verification required.`);
    }

    setActiveScreen('DASHBOARD');
    setSelectedTab('REQUESTS');
  }, [activeInspectionInstrument, activeInspectionRequest, addAuditLog, aiAnomalyResult, currentUser.licenseNumber, currentUser.name, currentUser.userId, testReadings]);

  // Run AI OCR Nameplate Scan
  const runAiOcrScan = useCallback(async () => {
    setIsOcrScanning(true);
    try {
      const result = await GeminiMetrologyService.runOcrScan();
      setOcrResult(result);
    } catch (err) {
      console.error('OCR Scan failed:', err);
    } finally {
      setIsOcrScanning(false);
    }
  }, []);

  // Public Certificate Search
  const searchPublicCertificate = useCallback((query: string, autoOpenViewer: boolean = false) => {
    const rawInput = (query || '').trim();
    const extracted = extractVerificationCode(rawInput);
    const searchTarget = (extracted || rawInput).trim();
    setPublicSearchQuery(searchTarget);

    const cleaned = searchTarget.toUpperCase();
    if (!cleaned) {
      setPublicSearchResult(null);
      setPublicHasSearched(false);
      return;
    }

    // 1. Direct search in certificates list
    let found = certificates.find(c => {
      const cNum = c.certificateNumber.toUpperCase();
      const iId = c.instrumentId.toUpperCase();
      const sNum = c.serialNumber.toUpperCase();
      const qUrl = (c.qrVerificationUrl || '').toUpperCase();

      return (
        cNum === cleaned ||
        iId === cleaned ||
        sNum === cleaned ||
        cleaned.includes(cNum) ||
        cNum.includes(cleaned) ||
        cleaned.includes(iId) ||
        cleaned.includes(sNum) ||
        (qUrl && (cleaned.includes(qUrl) || qUrl.includes(cleaned)))
      );
    });

    // 2. If not found in certificates directly, check instruments
    if (!found) {
      const matchingInst = instruments.find(i => 
        i.instrumentId.toUpperCase() === cleaned ||
        i.serialNumber.toUpperCase() === cleaned ||
        (i.certificateId && i.certificateId.toUpperCase() === cleaned) ||
        cleaned.includes(i.instrumentId.toUpperCase()) ||
        cleaned.includes(i.serialNumber.toUpperCase())
      );
      if (matchingInst && matchingInst.certificateId) {
        found = certificates.find(c => c.certificateNumber.toUpperCase() === matchingInst.certificateId?.toUpperCase());
      }
    }

    setPublicSearchResult(found || null);
    setPublicHasSearched(true);

    if (found && autoOpenViewer) {
      setScannedCertificateForViewer(found);
      setShowScannedPhotoViewer(true);
    }
  }, [certificates, instruments]);

  // Check URL query parameters, hashes, or pathnames for direct phone QR scan navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlForVerification = () => {
      const params = new URLSearchParams(window.location.search);
      let verifyCode = params.get('verify') || params.get('cert') || params.get('code') || params.get('id');

      if (!verifyCode && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
        verifyCode = hashParams.get('verify') || hashParams.get('cert') || hashParams.get('code');
      }

      if (!verifyCode) {
        const pathMatch = window.location.pathname.match(/(?:cert|verify|inst|verification)\/([^/?&#]+)/i);
        if (pathMatch && pathMatch[1]) {
          verifyCode = decodeURIComponent(pathMatch[1]);
        }
      }

      if (verifyCode && verifyCode !== 'true') {
        searchPublicCertificate(verifyCode, true);
        setActiveScreen('PUBLIC_VERIFY');
        setSelectedTab('PUBLIC_VERIFY');
      } else if (verifyCode === 'true' || window.location.pathname.includes('verify')) {
        setActiveScreen('PUBLIC_VERIFY');
        setSelectedTab('PUBLIC_VERIFY');
      }
    };

    checkUrlForVerification();
    window.addEventListener('popstate', checkUrlForVerification);
    return () => window.removeEventListener('popstate', checkUrlForVerification);
  }, [searchPublicCertificate]);

  // Run End-to-End Demo Flow (1-click interactive demo for hackathons and judges)
  const runDemoFlow = useCallback(async () => {
    // 1. Switch to Business Owner, register a new instrument
    setUserRole('BUSINESS_OWNER');
    setActiveScreen('DASHBOARD');
    setSelectedTab('INSTRUMENTS');

    const demoSerial = 'SN-APEX-' + Math.floor(10000 + Math.random() * 90000);
    const demoInstId = 'INST-WB-' + Math.floor(1000 + Math.random() * 9000);

    const newInst: InstrumentEntity = {
      id: 'demo-inst-' + Date.now(),
      instrumentId: demoInstId,
      name: 'Apex Automated Heavy Weighbridge Matrix-9',
      type: 'Weighbridge',
      category: 'Industrial',
      manufacturer: 'Avery Weigh-Tronix',
      modelNumber: 'BridgeMaster Super-80T',
      serialNumber: demoSerial,
      capacity: '80000',
      unitOfMeasurement: 'kg',
      location: 'Apex Inland Port Terminal, Gate 3',
      ownerBusiness: 'Apex Logistics & Freight Hub',
      ownerId: 'USR-BIZ-001',
      permissibleTolerance: 0.05,
      status: 'SUBMITTED',
      riskScore: 'LOW',
      riskReason: 'Statutory verification requested. Scheduled with inspector.',
      lastVerificationDate: 'None',
      nextVerificationDate: 'Under Metrology Review',
      certificateId: null,
      qrPayload: demoInstId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const demoReqId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: VerificationRequestEntity = {
      id: 'demo-req-' + Date.now(),
      requestId: demoReqId,
      instrumentId: demoInstId,
      instrumentName: newInst.name,
      instrumentType: newInst.type,
      ownerId: 'USR-BIZ-001',
      businessName: 'Apex Logistics & Freight Hub',
      status: 'UNDER_INSPECTION',
      submissionDate: new Date().toISOString().split('T')[0],
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedInspectorId: 'USR-INS-001',
      assignedInspectorName: 'Officer Ramakrishna',
      notes: 'End-to-End Demo statutory inspection testing.',
      inspectionFee: 450.0,
      paymentStatus: 'PAID'
    };

    setInstruments(prev => [newInst, ...prev]);
    setRequests(prev => [newReq, ...prev]);
    addAuditLog('DEMO_INITIALIZED', demoInstId, `Automated End-to-End Metrology verification flow started.`);

    // Switch to Inspector role and open workspace
    setUserRole('INSPECTOR');
    setActiveInspectionRequest(newReq);

    const points: TestReading[] = [
      { id: 'dp-1', standardWeight: 10000, actualReading: 10001.2, errorPercentage: 0.00012, toleranceLimit: 0.05, passed: true, notes: 'Zero point & 10-ton load test' },
      { id: 'dp-2', standardWeight: 25000, actualReading: 25002.5, errorPercentage: 0.0001, toleranceLimit: 0.05, passed: true, notes: 'Quarter capacity linearity' },
      { id: 'dp-3', standardWeight: 50000, actualReading: 49998.0, errorPercentage: -0.00004, toleranceLimit: 0.05, passed: true, notes: 'Half capacity load strain' },
      { id: 'dp-4', standardWeight: 80000, actualReading: 80006.4, errorPercentage: 0.00008, toleranceLimit: 0.05, passed: true, notes: 'Full statutory capacity test' }
    ];

    setTestReadings(points);
    setActiveScreen('INSPECTION_WORKSPACE');
  }, [addAuditLog]);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUsersList(INITIAL_USERS);
    setInstruments(INITIAL_INSTRUMENTS);
    setRequests(INITIAL_REQUESTS);
    setInspections([]);
    setCertificates(INITIAL_CERTIFICATES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGrievances(INITIAL_GRIEVANCES);
    setActiveScreen('LOGIN');
    setUserRoleState('BUSINESS_OWNER');
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(false);
    setSelectedTab('INSTRUMENTS');
    setOnlyMyBusinessInstruments(false);
  }, []);

  return (
    <MetrologyContext.Provider
      value={{
        userRole,
        currentUser,
        usersList,
        isAuthenticated,
        activeScreen,
        selectedTab,
        instruments,
        requests,
        inspections,
        certificates,
        auditLogs,
        grievances,
        activeInspectionRequest,
        activeInspectionInstrument,
        testReadings,
        aiAnomalyResult,
        isAiAnalyzing,
        selectedInstrument,
        selectedCertificate,
        showCertificateModal,
        showRegisterModal,
        activePaymentInstrument,
        showPaymentModal,
        activeReceiptToView,
        showReceiptModal,
        openPaymentModalForInstrument,
        closePaymentModal,
        openReceiptModal,
        closeReceiptModal,
        processInstrumentPayment,
        scannedCertificateForViewer,
        showScannedPhotoViewer,
        openScannedPhotoViewer,
        closeScannedPhotoViewer,
        showGrievanceModal,
        initialGrievanceCategory,
        grievanceTargetContext,
        openGrievanceModal,
        closeGrievanceModal,
        ocrResult,
        isOcrScanning,
        searchQuery,
        statusFilter,
        categoryFilter,
        onlyMyBusinessInstruments,
        publicSearchQuery,
        publicSearchResult,
        publicHasSearched,
        login,
        logout,
        registerUser,
        switchUserAccount,
        setUserRole,
        setActiveScreen,
        setSelectedTab,
        setSearchQuery,
        setStatusFilter,
        setCategoryFilter,
        setOnlyMyBusinessInstruments,
        setSelectedInstrument,
        setSelectedCertificate,
        setShowCertificateModal,
        setShowRegisterModal,
        requestVerification,
        registerInstrument,
        openInspectionWorkspace,
        addTestReading,
        updateTestReading,
        removeTestReading,
        runAiAnomalyAnalysis,
        completeInspection,
        submitGrievanceReport,
        resolveGrievance,
        runAiOcrScan,
        searchPublicCertificate,
        runDemoFlow,
        resetData
      }}
    >
      {children}
    </MetrologyContext.Provider>
  );
};

export const useMetrology = () => {
  const context = useContext(MetrologyContext);
  if (!context) {
    throw new Error('useMetrology must be used within a MetrologyProvider');
  }
  return context;
};
