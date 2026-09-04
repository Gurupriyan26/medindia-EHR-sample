import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientList } from './components/patients/PatientList';
import { PatientEHRProfile } from './components/ehr/PatientEHRProfile';
import { DoctorConsultationRoom } from './components/doctor/DoctorConsultationRoom';
import { ConsentManager } from './components/consent/ConsentManager';
import { AbdmWorkflowVisualizer } from './components/abdm/AbdmWorkflowVisualizer';
import { LabReportsManager } from './components/labs/LabReportsManager';
import { AppointmentsManager } from './components/appointments/AppointmentsManager';
import { SettingsView } from './components/settings/SettingsView';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { AISummaryModal } from './components/ai/AISummaryModal';
import { Patient } from './types';

export const AppContent: React.FC = () => {
  const { activeTab, addNewPatient, updatePatientDetails } = useApp();

  // Modal States
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  const handleOpenNewPatient = () => {
    setEditingPatient(null);
    setIsNewPatientModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsNewPatientModalOpen(true);
  };

  const handleSavePatient = async (data: Partial<Patient>) => {
    if (editingPatient) {
      await updatePatientDetails(editingPatient._id || editingPatient.id || '', data);
    } else {
      await addNewPatient(data);
    }
    setIsNewPatientModalOpen(false);
    setEditingPatient(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Navbar */}
        <Navbar onOpenNewPatientModal={handleOpenNewPatient} />

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView onOpenNewPatientModal={handleOpenNewPatient} />
            )}

            {activeTab === 'patients' && (
              <PatientList
                onOpenNewPatientModal={handleOpenNewPatient}
                onEditPatient={handleEditPatient}
              />
            )}

            {activeTab === 'ehr' && (
              <PatientEHRProfile
                onEditPatient={handleEditPatient}
                onOpenLabModal={() => setIsLabModalOpen(true)}
              />
            )}

            {activeTab === 'doctor' && <DoctorConsultationRoom />}

            {activeTab === 'appointments' && <AppointmentsManager />}

            {activeTab === 'labs' && (
              <LabReportsManager
                isAddModalOpen={isLabModalOpen}
                onCloseAddModal={() => setIsLabModalOpen(false)}
              />
            )}

            {activeTab === 'consent' && <ConsentManager />}

            {activeTab === 'abdm' && <AbdmWorkflowVisualizer />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <AISummaryModal />
      <PatientFormModal
        isOpen={isNewPatientModalOpen}
        onClose={() => {
          setIsNewPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        initialData={editingPatient}
      />
    </div>
  );
};
