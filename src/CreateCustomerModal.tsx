import { useState } from 'react';
import type { Customer, RiskLevel, JourneyStage } from './types';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomer: (customer: Omit<Customer, 'id' | 'interactions'>) => void;
}

const CreateCustomerModal = ({ isOpen, onClose, onCreateCustomer }: CreateCustomerModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    stage: 'Acquisition' as JourneyStage,
    healthScore: 75,
    mrr: 0,
    tenure: 0,
    riskLevel: 'low' as RiskLevel,
    lastContactDays: 0,
    assignedTo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCustomer(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      stage: 'Acquisition',
      healthScore: 75,
      mrr: 0,
      tenure: 0,
      riskLevel: 'low',
      lastContactDays: 0,
      assignedTo: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Customer</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Acme Corporation"
              />
            </div>

            {/* Journey Stage */}
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                Journey Stage
              </label>
              <select
                id="stage"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as JourneyStage })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Acquisition">Acquisition</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Support">Support</option>
                <option value="Renewal">Renewal</option>
              </select>
            </div>

            {/* MRR and Tenure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="mrr" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Recurring Revenue ($)
                </label>
                <input
                  type="number"
                  id="mrr"
                  min="0"
                  value={formData.mrr}
                  onChange={(e) => setFormData({ ...formData, mrr: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="tenure" className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  id="tenure"
                  min="0"
                  value={formData.tenure}
                  onChange={(e) => setFormData({ ...formData, tenure: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Health Score and Risk Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="healthScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Health Score (0-100)
                </label>
                <input
                  type="number"
                  id="healthScore"
                  min="0"
                  max="100"
                  value={formData.healthScore}
                  onChange={(e) => setFormData({ ...formData, healthScore: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  id="riskLevel"
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Assigned To and Last Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="lastContactDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Contact (days ago)
                </label>
                <input
                  type="number"
                  id="lastContactDays"
                  min="0"
                  value={formData.lastContactDays}
                  onChange={(e) => setFormData({ ...formData, lastContactDays: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
