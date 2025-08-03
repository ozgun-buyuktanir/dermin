import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, Palette, Database, RefreshCw, Trash2, Download, Save } from 'lucide-react';
import authService from '../services/authService';
import dataService from '../services/dataService';

const Settings = ({ isOpen, onClose, currentUser, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        display_name: '',
        email: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                display_name: currentUser.display_name || '',
                email: currentUser.email || ''
            });
        }
    }, [currentUser]);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'survey', label: 'Survey', icon: RefreshCw },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'theme', label: 'Theme', icon: Palette },
        { id: 'data', label: 'Data', icon: Database }
    ];

    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            const updateData = {
                display_name: formData.display_name?.trim()
            };
            
            const response = await fetch('http://localhost:8000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            setMessage('Profile updated successfully!');
            onUserUpdate(updatedUser);
            
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSurvey = async () => {
        if (!confirm('Are you sure you want to reset your survey? This will allow you to retake it.')) {
            return;
        }

        setLoading(true);
        try {
            // Reset survey status
            const response = await fetch('http://localhost:8000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    survey_completed: false,
                    survey_data: null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reset survey');
            }

            setMessage('Survey reset successfully! Please refresh the page.');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Survey reset error:', error);
            setMessage('Failed to reset survey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            dataService.exportUserData();
            setMessage('Data exported successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to export data.');
        }
    };

    const handleClearData = async () => {
        if (!confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            return;
        }

        try {
            dataService.clearAllData();
            setMessage('All data cleared successfully!');
            setTimeout(() => {
                authService.logout();
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            setMessage('Failed to clear data.');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-100">Profile Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#132D46]/50 border-2 border-[#778DA9]/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#90BE6D] focus:border-[#90BE6D] transition-all duration-200"
                                    placeholder="Your display name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-[#132D46]/30 border-2 border-[#778DA9]/30 rounded-lg text-gray-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-lg text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                );

            case 'survey':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-100">Survey Management</h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-[#132D46]/30 rounded-lg border border-[#778DA9]/20">
                                <h4 className="font-medium text-gray-200 mb-2">Survey Status</h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    {currentUser?.survey_completed ? 
                                        'You have completed the skin analysis survey.' : 
                                        'You have not completed the survey yet.'
                                    }
                                </p>
                                {currentUser?.survey_completed && (
                                    <button
                                        onClick={handleResetSurvey}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#778DA9] hover:bg-[#778DA9]/80 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={16} />
                                        Reset Survey
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-100">Privacy Settings</h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-[#132D46]/30 rounded-lg border border-[#778DA9]/20">
                                <h4 className="font-medium text-gray-200 mb-2">Data Collection</h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    We collect data to improve your skin analysis experience. 
                                    You can manage your data preferences here.
                                </p>
                                <label className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        defaultChecked={dataService.getStoredConsent()}
                                        onChange={(e) => dataService.setPrivacyConsent(e.target.checked)}
                                        className="w-4 h-4 rounded border-[#778DA9] text-[#90BE6D] focus:ring-[#90BE6D]"
                                    />
                                    <span className="text-gray-300">Allow data collection for analytics</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 'theme':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-100">Appearance</h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-[#132D46]/30 rounded-lg border border-[#778DA9]/20">
                                <h4 className="font-medium text-gray-200 mb-2">Theme</h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    Currently using the default dark theme. More themes coming soon!
                                </p>
                                <div className="flex gap-3">
                                    <div className="w-20 h-12 bg-gradient-to-br from-[#0D1B2A] to-[#132D46] rounded-lg border-2 border-[#90BE6D] flex items-center justify-center">
                                        <span className="text-xs text-white">Dark</span>
                                    </div>
                                    <div className="w-20 h-12 bg-gray-300 rounded-lg opacity-50 flex items-center justify-center">
                                        <span className="text-xs text-gray-600">Light</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-100">Data Management</h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-[#132D46]/30 rounded-lg border border-[#778DA9]/20">
                                <h4 className="font-medium text-gray-200 mb-2">Export Data</h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    Download all your data including survey responses and analysis history.
                                </p>
                                <button
                                    onClick={handleExportData}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#90BE6D] hover:bg-[#90BE6D]/80 rounded-lg text-white font-medium transition-colors"
                                >
                                    <Download size={16} />
                                    Export Data
                                </button>
                            </div>

                            <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                                <h4 className="font-medium text-red-300 mb-2">Danger Zone</h4>
                                <p className="text-red-400 text-sm mb-4">
                                    This will permanently delete all your data and log you out.
                                </p>
                                <button
                                    onClick={handleClearData}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0D1B2A] border border-[#778DA9]/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#778DA9]/20">
                        <h2 className="text-2xl font-bold text-gray-100">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[#778DA9]/30 transition-colors"
                        >
                            <X className="text-gray-300" size={20} />
                        </button>
                    </div>

                    <div className="flex">
                        {/* Sidebar */}
                        <div className="w-64 p-6 border-r border-[#778DA9]/20">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-[#90BE6D] text-white'
                                                    : 'text-gray-300 hover:bg-[#778DA9]/30'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-4 p-3 rounded-lg ${
                                        message.includes('successfully') || message.includes('exported')
                                            ? 'bg-green-900/20 border border-green-500/20 text-green-300'
                                            : 'bg-red-900/20 border border-red-500/20 text-red-300'
                                    }`}
                                >
                                    {message}
                                </motion.div>
                            )}
                            {renderTabContent()}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Settings;
