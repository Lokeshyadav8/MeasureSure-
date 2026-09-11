import React from 'react';
import { MetrologyProvider, useMetrology } from './context/MetrologyContext';
import { HeaderBar } from './components/common/HeaderBar';
import { LandingScreen } from './components/screens/LandingScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { InspectionWorkspaceScreen } from './components/screens/InspectionWorkspaceScreen';
import { PublicQrVerificationScreen } from './components/screens/PublicQrVerificationScreen';
import { CertificateModal } from './components/modals/CertificateModal';
import { RegisterInstrumentModal } from './components/modals/RegisterInstrumentModal';
import { InstrumentDetailsModal } from './components/modals/InstrumentDetailsModal';
import { StatutoryPaymentModal } from './components/modals/StatutoryPaymentModal';
import { StatutoryChallanReceiptModal } from './components/modals/StatutoryChallanReceiptModal';
import { StatutoryGrievanceModal } from './components/modals/StatutoryGrievanceModal';
import { GrievanceRedressalScreen } from './components/screens/GrievanceRedressalScreen';
import { ScannedCertificatePhotoViewer } from './components/common/ScannedCertificatePhotoViewer';

const AppContent: React.FC = () => {
  const {
    activeScreen,
    isAuthenticated,
    selectedCertificate,
    showCertificateModal,
    setShowCertificateModal,
    showRegisterModal,
    setShowRegisterModal,
    selectedInstrument,
    setSelectedInstrument,
    requestVerification,
    setSelectedCertificate,
    certificates,
    // Payments
    activePaymentInstrument,
    showPaymentModal,
    activeReceiptToView,
    showReceiptModal,
    openPaymentModalForInstrument,
    closePaymentModal,
    openReceiptModal,
    closeReceiptModal,
    processInstrumentPayment,
    // Scanned Certificate Photo Viewer
    scannedCertificateForViewer,
    showScannedPhotoViewer,
    openScannedPhotoViewer,
    closeScannedPhotoViewer,
    // Grievance / Complaint Modal
    showGrievanceModal,
    initialGrievanceCategory,
    grievanceTargetContext,
    closeGrievanceModal
  } = useMetrology();

  const matchingCert = selectedInstrument
    ? certificates.find(c => c.instrumentId === selectedInstrument.instrumentId || c.certificateNumber === selectedInstrument.certificateId) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      <HeaderBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeScreen === 'GRIEVANCE_PORTAL' && <GrievanceRedressalScreen />}
        {activeScreen === 'PUBLIC_VERIFY' && <PublicQrVerificationScreen />}
        {activeScreen === 'LANDING' && <LandingScreen />}
        {(!isAuthenticated && activeScreen !== 'LANDING' && activeScreen !== 'PUBLIC_VERIFY' && activeScreen !== 'GRIEVANCE_PORTAL') && <LoginScreen />}
        {(isAuthenticated && activeScreen === 'LOGIN') && <LoginScreen />}
        {(isAuthenticated && activeScreen === 'DASHBOARD') && <DashboardScreen />}
        {(isAuthenticated && activeScreen === 'INSPECTION_WORKSPACE') && <InspectionWorkspaceScreen />}
      </main>

      {/* Global Modals */}
      <CertificateModal
        isOpen={showCertificateModal}
        certificate={selectedCertificate}
        onClose={() => setShowCertificateModal(false)}
      />

      <RegisterInstrumentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      {/* Statutory Grievance & Complaint Redressal Modal */}
      <StatutoryGrievanceModal
        isOpen={showGrievanceModal}
        onClose={closeGrievanceModal}
        defaultCategory={initialGrievanceCategory}
        targetContext={grievanceTargetContext}
      />

      <InstrumentDetailsModal
        isOpen={!!selectedInstrument}
        instrument={selectedInstrument}
        certificate={matchingCert}
        onClose={() => setSelectedInstrument(null)}
        onRequestVerification={requestVerification}
        onViewCertificate={(cert) => {
          setSelectedCertificate(cert);
          setShowCertificateModal(true);
        }}
        onPayFee={(inst) => {
          openPaymentModalForInstrument(inst);
        }}
        onViewReceipt={(receipt) => {
          openReceiptModal(receipt);
        }}
      />

      {/* Bharat Kosh Statutory Payment Gateway Modal */}
      <StatutoryPaymentModal
        isOpen={showPaymentModal}
        instrument={activePaymentInstrument}
        onClose={closePaymentModal}
        onPaymentSuccess={(receipt) => {
          processInstrumentPayment(receipt);
          openReceiptModal(receipt);
        }}
      />

      {/* Statutory e-Challan / Treasury Form TR-5 Receipt Modal */}
      <StatutoryChallanReceiptModal
        isOpen={showReceiptModal}
        receipt={activeReceiptToView}
        onClose={closeReceiptModal}
      />

      {/* Scanned Certificate Photo Viewer (Dedicated photo viewer for scanned certificates with QR removed) */}
      <ScannedCertificatePhotoViewer
        isOpen={showScannedPhotoViewer}
        certificate={scannedCertificateForViewer}
        onClose={closeScannedPhotoViewer}
        availableCertificates={certificates}
        onSelectCertificate={(cert) => openScannedPhotoViewer(cert)}
      />
    </div>
  );
};

export function App() {
  return (
    <MetrologyProvider>
      <AppContent />
    </MetrologyProvider>
  );
}

export default App;
