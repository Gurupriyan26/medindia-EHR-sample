import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabReport, Patient } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  FlaskConical,
  Search,
  Plus,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  Activity,
  Filter,
} from 'lucide-react';

interface LabReportsManagerProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}

export const LabReportsManager: React.FC<LabReportsManagerProps> = ({
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const { labReports, patients, selectedPatient, addNewLabReport, setSelectedPatientId, setActiveTab } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [targetPatientId, setTargetPatientId] = useState(selectedPatient?._id || selectedPatient?.id || patients[0]?._id || '');
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState<LabReport['category']>('Biochemistry');
  const [labName, setLabName] = useState('MedIndia Central Diagnostics');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Rao, MD');
  const [overallResult, setOverallResult] = useState('');
  const [status, setStatus] = useState<LabReport['status']>('Normal');
  const [remarks, setRemarks] = useState('');

  // Parameter Builder
  const [parameters, setParameters] = useState<LabReport['parameters']>([
    {
      name: 'Primary Parameter',
      value: '7.8',
      unit: '%',
      referenceRange: '< 5.7 (Normal)',
      isAbnormal: true,
    },
  ]);
  const [paramName, setParamName] = useState('');
  const [paramVal, setParamVal] = useState('');
  const [paramUnit, setParamUnit] = useState('mg/dL');
  const [paramRef, setParamRef] = useState('70 - 99');
  const [paramAbnormal, setParamAbnormal] = useState(false);

  const handleAddParam = () => {
    if (!paramName.trim() || !paramVal.trim()) return;
    setParameters([
      ...parameters,
      {
        name: paramName.trim(),
        value: paramVal.trim(),
        unit: paramUnit.trim(),
        referenceRange: paramRef.trim(),
        isAbnormal: paramAbnormal,
      },
    ]);
    setParamName('');
    setParamVal('');
    setParamAbnormal(false);
  };

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !overallResult.trim()) {
      alert('Please enter Test Name and Overall Result.');
      return;
    }

    const patient = patients.find(p => p._id === targetPatientId || p.id === targetPatientId) || patients[0];

    await addNewLabReport({
      patientId: patient._id || patient.id,
      patientName: patient.name,
      testName: testName.trim(),
      category,
      orderedByDoctor: doctorName,
      labName,
      sampleCollectionDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      parameters,
      overallResult: overallResult.trim(),
      status,
      remarks: remarks.trim() || undefined,
    });

    onCloseAddModal();
    setTestName('');
    setOverallResult('');
    setRemarks('');
  };

  // Filtered List
  const filteredReports = labReports.filter(l => {
    const matchesSearch =
      l.testName.toLowerCase().includes(search.toLowerCase()) ||
      (l.patientName && l.patientName.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Diagnostic Lab Investigations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pathology, Biochemistry, Hematology, and Radiology test records
          </p>
        </div>

        <button
          onClick={() => onCloseAddModal()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Enter Lab Result</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test name or patient..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Hematology">Hematology</option>
            <option value="Radiology">Radiology</option>
            <option value="Pathology">Pathology</option>
            <option value="Cardiology">Cardiology</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Abnormal">Abnormal</option>
            <option value="Critical">Critical</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No diagnostic lab reports match your filters.
          </div>
        ) : (
          filteredReports.map(lab => (
            <div
              key={lab._id || lab.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4 hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{lab.testName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient:{' '}
                    <button
                      onClick={() => {
                        setSelectedPatientId(lab.patientId);
                        setActiveTab('ehr');
                      }}
                      className="font-bold text-brand-600 hover:underline"
                    >
                      {lab.patientName || 'Patient Record'}
                    </button>
                  </p>
                </div>
                <Badge variant={lab.status === 'Normal' ? 'green' : 'red'}>
                  {lab.status}
                </Badge>
              </div>

              {/* Parameters List */}
              {lab.parameters && lab.parameters.length > 0 && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {lab.parameters.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${p.isAbnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.value} {p.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({p.referenceRange})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-700">
                <span className="font-semibold">Result: </span>
                <span>{lab.overallResult}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{lab.labName}</span>
                <span>Report Date: {lab.reportDate}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Lab Report Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title="Record New Diagnostic Lab Investigation"
        subtitle="Add blood tests, metabolic panels, pathology, or radiology results"
        maxWidth="3xl"
        footer={
          <>
            <button
              type="button"
              onClick={onCloseAddModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReport}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
            >
              Save Lab Report
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveReport} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
              <select
                value={targetPatientId}
                onChange={e => setTargetPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white"
              >
                {patients.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.age}y {p.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              >
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Radiology">Radiology</option>
                <option value="Pathology">Pathology</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Cardiology">Cardiology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Blood Count (CBC)"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Overall Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Critical">Critical</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Interpretation / Overall Result *</label>
            <input
              type="text"
              required
              placeholder="e.g. Parameters within normal reference ranges"
              value={overallResult}
              onChange={e => setOverallResult(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500"
            />
          </div>

          {/* Parameters Section */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Parameters & Observed Values
            </h4>

            {parameters.map((p, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border rounded-lg flex items-center justify-between text-xs mb-1.5">
                <div>
                  <span className="font-semibold">{p.name}: </span>
                  <span className={p.isAbnormal ? 'font-bold text-rose-600' : 'font-bold text-slate-900'}>
                    {p.value} {p.unit}
                  </span>
                  <span className="text-slate-400 ml-2">(Ref: {p.referenceRange})</span>
                </div>
                <button type="button" onClick={() => handleRemoveParam(idx)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
              <input
                type="text"
                placeholder="Parameter Name"
                value={paramName}
                onChange={e => setParamName(e.target.value)}
                className="sm:col-span-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Value"
                value={paramVal}
                onChange={e => setParamVal(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Unit"
                value={paramUnit}
                onChange={e => setParamUnit(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddParam}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold"
              >
                Add Item
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
