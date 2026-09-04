import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  Visit,
  LabReport,
  ConsentArtefact,
  Appointment,
  UserRole,
  AISummaryResponse,
} from '../types';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  patients: Patient[];
  visits: Visit[];
  labReports: LabReport[];
  consents: ConsentArtefact[];
  appointments: Appointment[];
  selectedPatient: Patient | null;
  selectedPatientId: string | null;
  activeTab: string;
  currentRole: UserRole;
  isLoading: boolean;
  searchQuery: string;
  toasts: ToastMessage[];
  aiSummary: AISummaryResponse | null;
  isAiModalOpen: boolean;
  isAiLoading: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  setCurrentRole: (role: UserRole) => void;
  setSelectedPatientId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  openAiSummaryModal: (patientId?: string) => Promise<void>;
  closeAiSummaryModal: () => void;

  // Data mutations
  refreshAllData: () => Promise<void>;
  addNewPatient: (data: Partial<Patient>) => Promise<Patient>;
  updatePatientDetails: (id: string, data: Partial<Patient>) => Promise<Patient>;
  addNewVisit: (data: Partial<Visit>) => Promise<Visit>;
  addNewLabReport: (data: Partial<LabReport>) => Promise<LabReport>;
  updateConsentState: (id: string, status: 'GRANTED' | 'REVOKED') => Promise<void>;
  addNewConsent: (data: Partial<ConsentArtefact>) => Promise<ConsentArtefact>;
  addNewAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  updateAppointmentState: (id: string, status: Appointment['status']) => Promise<void>;
  resetToDefaultDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [consents, setConsents] = useState<ConsentArtefact[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('pat-101');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('doctor');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Toast dispatch
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial data
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pData, vData, lData, cData, aData] = await Promise.all([
        api.getPatients(),
        api.getVisits(),
        api.getLabReports(),
        api.getConsents(),
        api.getAppointments(),
      ]);

      setPatients(pData);
      setVisits(vData);
      setLabReports(lData);
      setConsents(cData);
      setAppointments(aData);
    } catch (err) {
      console.error('Data refresh error:', err);
      showToast({
        type: 'error',
        title: 'Connection Notice',
        message: 'Could not reach server. Switched to offline demo mode.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Derive selected patient
  const selectedPatient = patients.find(p => p._id === selectedPatientId || p.id === selectedPatientId) || patients[0] || null;

  // AI Patient Summary Handler
  const openAiSummaryModal = async (targetPatientId?: string) => {
    const targetId = targetPatientId || selectedPatient?._id || selectedPatient?.id || 'pat-101';
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiSummary(null);

    try {
      const summary = await api.generateAISummary(targetId);
      setAiSummary(summary);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'AI Summary Failed',
        message: err.message || 'Unable to generate summary',
      });
      setIsAiModalOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const closeAiSummaryModal = () => {
    setIsAiModalOpen(false);
  };

  // Data Mutations
  const addNewPatient = async (data: Partial<Patient>): Promise<Patient> => {
    const created = await api.createPatient(data);
    setPatients(prev => [created, ...prev]);
    setSelectedPatientId(created._id || created.id || null);
    showToast({
      type: 'success',
      title: 'Patient Registered',
      message: `${created.name} (ABHA: ${created.abhaId}) enrolled successfully.`,
    });
    return created;
  };

  const updatePatientDetails = async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const updated = await api.updatePatient(id, data);
    setPatients(prev => prev.map(p => (p._id === id || p.id === id ? updated : p)));
    showToast({
      type: 'success',
      title: 'Patient Updated',
      message: `Profile changes for ${updated.name} have been saved.`,
    });
    return updated;
  };

  const addNewVisit = async (data: Partial<Visit>): Promise<Visit> => {
    const created = await api.createVisit(data);
    setVisits(prev => [created, ...prev]);
    // Refresh patients to update lastVisitDate
    const updatedPatients = await api.getPatients();
    setPatients(updatedPatients);
    showToast({
      type: 'success',
      title: 'Consultation Recorded',
      message: `Clinical encounter with ${created.patientName || 'patient'} saved to EHR.`,
    });
    return created;
  };

  const addNewLabReport = async (data: Partial<LabReport>): Promise<LabReport> => {
    const created = await api.createLabReport(data);
    setLabReports(prev => [created, ...prev]);
    showToast({
      type: 'success',
      title: 'Lab Report Added',
      message: `${created.testName} report recorded successfully.`,
    });
    return created;
  };

  const updateConsentState = async (id: string, status: 'GRANTED' | 'REVOKED') => {
    const updated = await api.updateConsentStatus(id, status);
    setConsents(prev => prev.map(c => (c._id === id || c.id === id ? updated : c)));
    showToast({
      type: status === 'GRANTED' ? 'success' : 'warning',
      title: status === 'GRANTED' ? 'Consent Granted' : 'Consent Revoked',
      message: `ABDM consent artefact ${updated.signatureMock || id} status updated to ${status}.`,
    });
  };

  const addNewConsent = async (data: Partial<ConsentArtefact>): Promise<ConsentArtefact> => {
    const created = await api.createConsent(data);
    setConsents(prev => [created, ...prev]);
    showToast({
      type: 'success',
      title: 'Consent Created',
      message: `Consent request registered for ${created.requesterName}.`,
    });
    return created;
  };

  const addNewAppointment = async (data: Partial<Appointment>): Promise<Appointment> => {
    const created = await api.createAppointment(data);
    setAppointments(prev => [...prev, created]);
    showToast({
      type: 'success',
      title: 'Appointment Booked',
      message: `Token #${created.tokenNumber} issued for ${created.patientName} at ${created.timeSlot}.`,
    });
    return created;
  };

  const updateAppointmentState = async (id: string, status: Appointment['status']) => {
    const updated = await api.updateAppointmentStatus(id, status);
    setAppointments(prev => prev.map(a => (a._id === id || a.id === id ? updated : a)));
    showToast({
      type: 'info',
      title: 'Appointment Status',
      message: `Appointment for ${updated.patientName} marked as ${status}.`,
    });
  };

  const resetToDefaultDemo = () => {
    api.resetDemoData();
    refreshAllData();
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'Initial fictional patient and clinical dataset reloaded.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        visits,
        labReports,
        consents,
        appointments,
        selectedPatient,
        selectedPatientId,
        activeTab,
        currentRole,
        isLoading,
        searchQuery,
        toasts,
        aiSummary,
        isAiModalOpen,
        isAiLoading,
        setActiveTab,
        setCurrentRole,
        setSelectedPatientId,
        setSearchQuery,
        showToast,
        removeToast,
        openAiSummaryModal,
        closeAiSummaryModal,
        refreshAllData,
        addNewPatient,
        updatePatientDetails,
        addNewVisit,
        addNewLabReport,
        updateConsentState,
        addNewConsent,
        addNewAppointment,
        updateAppointmentState,
        resetToDefaultDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
