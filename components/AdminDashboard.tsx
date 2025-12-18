
import React, { useState, useEffect } from 'react';
import { InventoryItem, User, UserRole, OnboardingFormTemplate, FormField } from '../types';
import { mockService } from '../services/mockDataService';
import { Package, Users, AlertTriangle, Check, X, Settings, LayoutDashboard, Box, FileText, Plus, Trash2, GripVertical, Save } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'forms'>('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form Customization State
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CONSUMER);
  const [formTemplate, setFormTemplate] = useState<OnboardingFormTemplate | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
      // Load form template when role or tab changes
      if (activeTab === 'forms') {
          const template = mockService.getFormTemplate(selectedRole);
          if (template) {
              setFormTemplate(JSON.parse(JSON.stringify(template))); // Deep copy for editing
          }
      }
  }, [activeTab, selectedRole]);

  const refreshData = () => {
    setInventory(mockService.getAllInventory());
    setUsers(mockService.getAllUsers());
  };

  const handleApprove = (itemId: string) => {
    mockService.updateInventoryStatus(itemId, 'Available');
    refreshData();
  };

  const handleReject = (itemId: string) => {
    mockService.updateInventoryStatus(itemId, 'Rejected');
    refreshData();
  };

  // Form Editor Handlers
  const handleSaveTemplate = () => {
      if (formTemplate) {
          mockService.updateFormTemplate(selectedRole, formTemplate);
          alert(`Onboarding form for ${selectedRole} updated successfully!`);
      }
  };

  const addField = (sectionIndex: number) => {
      if (!formTemplate) return;
      const newField: FormField = {
          id: `new-${Date.now()}`,
          label: 'New Question',
          type: 'text',
          required: false,
          placeholder: ''
      };
      const newSections = [...formTemplate.sections];
      newSections[sectionIndex].fields.push(newField);
      setFormTemplate({ ...formTemplate, sections: newSections });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
      if (!formTemplate) return;
      const newSections = [...formTemplate.sections];
      newSections[sectionIndex].fields.splice(fieldIndex, 1);
      setFormTemplate({ ...formTemplate, sections: newSections });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, key: keyof FormField, value: any) => {
      if (!formTemplate) return;
      const newSections = [...formTemplate.sections];
      newSections[sectionIndex].fields[fieldIndex] = {
          ...newSections[sectionIndex].fields[fieldIndex],
          [key]: value
      };
      setFormTemplate({ ...formTemplate, sections: newSections });
  };

  // KPI Calculations
  const farmersItems = inventory.filter(i => mockService.getAllUsers().find(u => u.id === i.ownerId)?.role === 'FARMER').length;
  const wholesalersItems = inventory.filter(i => mockService.getAllUsers().find(u => u.id === i.ownerId)?.role === 'WHOLESALER').length;
  const totalWholesalers = users.filter(u => u.role === 'WHOLESALER').length;
  const excessItems = inventory.filter(i => {
    const expiry = new Date(i.expiryDate).getTime();
    const now = new Date().getTime();
    const daysLeft = (expiry - now) / (1000 * 3600 * 24);
    return daysLeft < 3;
  }).length;

  const pendingItems = inventory.filter(i => i.status === 'Pending Approval');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform Zero Admin Dashboard</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-1 md:flex-none ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-1 md:flex-none ${activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Pending Approvals
            </button>
            <button 
                onClick={() => setActiveTab('forms')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-1 md:flex-none ${activeTab === 'forms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Form Customization
            </button>
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 font-medium">Farmers' Inventory Items</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{farmersItems}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                <Package size={24} />
            </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 font-medium">Wholesalers' Inventory Items</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{wholesalersItems}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Box size={24} />
            </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Wholesalers</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalWholesalers}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <Users size={24} />
            </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 font-medium">Excess Inventory Items</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{excessItems}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-500">
                <AlertTriangle size={24} />
            </div>
            </div>
        </div>
      )}

      {/* Pending Approvals List */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve farmer submissions before they enter the marketplace</p>
            </div>

            <div className="divide-y divide-gray-100">
            {pendingItems.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                No pending approvals found.
                </div>
            ) : (
                pendingItems.map(item => {
                const product = mockService.getAllProducts().find(p => p.id === item.productId);
                return (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{product?.name} - {item.quantityKg}kg</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            Pending
                        </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-500">Farmer:</span> {item.originalFarmerName}</p>
                        <p><span className="font-medium text-gray-500">Harvest Date:</span> {new Date(item.harvestDate).toLocaleDateString()}</p>
                        <p><span className="font-medium text-gray-500">Shelf Life:</span> {Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24))} days</p>
                        </div>

                        {item.notes && (
                        <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-700 border border-gray-100">
                            <span className="font-semibold block text-xs uppercase text-gray-500 mb-1">Notes:</span>
                            {item.notes}
                        </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                        <Check size={16} />
                        Approve
                        </button>
                        <button 
                        onClick={() => handleReject(item.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                        <X size={16} />
                        Reject
                        </button>
                    </div>
                    </div>
                );
                })
            )}
            </div>
        </div>
      )}

      {/* FORM CUSTOMIZATION TAB */}
      {activeTab === 'forms' && formTemplate && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">Onboarding Form Builder</h2>
                          <p className="text-sm text-gray-500">Customize the questions asked during sign-up for each role.</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                          <select 
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500"
                          >
                              <option value={UserRole.CONSUMER}>Marketplace Buyer</option>
                              <option value={UserRole.WHOLESALER}>Wholesaler</option>
                              <option value={UserRole.FARMER}>Farmer</option>
                          </select>
                          <button 
                              onClick={handleSaveTemplate}
                              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold flex items-center justify-center gap-2 shadow-sm"
                          >
                              <Save size={18}/> Save Form
                          </button>
                      </div>
                  </div>

                  <div className="space-y-8">
                      {formTemplate.sections.map((section, sIdx) => (
                          <div key={section.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                                  <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">{section.title}</h3>
                              </div>
                              <div className="p-4 space-y-3">
                                  {section.fields.map((field, fIdx) => (
                                      <div key={field.id} className="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded-lg group hover:border-indigo-300 transition-colors">
                                          <div className="mt-3 text-gray-400 cursor-move shrink-0">
                                              <GripVertical size={16}/>
                                          </div>
                                          
                                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                              <div className="md:col-span-2">
                                                  <label className="block text-xs text-gray-500 mb-1">Field Label</label>
                                                  <input 
                                                      type="text" 
                                                      value={field.label}
                                                      onChange={(e) => updateField(sIdx, fIdx, 'label', e.target.value)}
                                                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                  />
                                              </div>
                                              <div>
                                                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                                                  <select 
                                                      value={field.type}
                                                      onChange={(e) => updateField(sIdx, fIdx, 'type', e.target.value)}
                                                      className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                                                  >
                                                      <option value="text">Text Input</option>
                                                      <option value="textarea">Text Area</option>
                                                      <option value="number">Number</option>
                                                      <option value="email">Email</option>
                                                      <option value="tel">Phone</option>
                                                      <option value="checkbox">Checkbox</option>
                                                      <option value="select">Dropdown</option>
                                                      <option value="date">Date</option>
                                                  </select>
                                              </div>
                                              <div className="flex items-center gap-4">
                                                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                                                      <input 
                                                          type="checkbox" 
                                                          checked={field.required}
                                                          onChange={(e) => updateField(sIdx, fIdx, 'required', e.target.checked)}
                                                          className="rounded text-indigo-600 focus:ring-indigo-500"
                                                      />
                                                      <span className="text-sm text-gray-700">Required</span>
                                                  </label>
                                                  <button 
                                                      onClick={() => removeField(sIdx, fIdx)}
                                                      className="mt-5 ml-auto text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                                      title="Remove Field"
                                                  >
                                                      <Trash2 size={16}/>
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  <button 
                                      onClick={() => addField(sIdx)}
                                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                  >
                                      <Plus size={16}/> Add Field to {section.title}
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
