import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, LogOut, User, Settings as SettingsIcon, UploadCloud, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import dataService from '../services/dataService';
import SkinSurvey from '../components/SkinSurvey';
import Settings from '../components/Settings';
import logo from '../../dermin_logo.png';

function Dashboard() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [showSurvey, setShowSurvey] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // File upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const checkAuthAndSurvey = async () => {
            setLoading(true);
            if (authService.isAuthenticated()) {
                try {
                    const user = await authService.getCurrentUser();
                    if (user) {
                        setCurrentUser(user);
                        // Use display_name if available, otherwise empty string (no "User" fallback)
                        const displayName = user.display_name?.trim() || '';
                        setUserName(displayName);

                        // Check survey status from backend
                        const surveyStatus = await dataService.getSurveyStatus();
                        if (!surveyStatus.survey_completed) {
                            setShowSurvey(true);
                        }
                    } else {
                        navigate('/login');
                    }
                } catch (err) {
                    console.error('Auth check error:', err);
                    setError('Session expired. Please log in again.');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        };

        checkAuthAndSurvey();
    }, [navigate]);

    const handleLogout = async () => {
        authService.logout();
        navigate('/login');
    };

    const handleSurveyComplete = (surveyData, alreadyCompleted = false) => {
        setShowSurvey(false);
        
        if (alreadyCompleted) {
            console.log('Survey was already completed');
        } else {
            console.log('Survey completed successfully:', surveyData);
            // Update current user with new display name
            if (surveyData?.name) {
                setCurrentUser(prev => ({
                    ...prev,
                    display_name: surveyData.name
                }));
                setUserName(surveyData.name);
            }
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setCurrentUser(updatedUser);
        setUserName(updatedUser.display_name || '');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadError('');
            setUploadSuccess(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadError('Please select a file to upload.');
            return;
        }
        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('auth_token');
            console.log('Token found:', token ? 'Yes' : 'No');
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/login');
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Progress simulation for UI
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 200);

            // API call to analyze skin
            const response = await fetch('http://localhost:8000/api/analyze-skin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('🔍 API Response:', result);
            console.log('File uploaded and analyzed:', file.name);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadSuccess(true);

            // Show completion message and redirect
            setTimeout(() => {
                if (result.analysis_id) {
                    console.log('✅ Redirecting to results:', result.analysis_id);
                    navigate(`/results/${result.analysis_id}`);
                } else {
                    console.error('❌ No analysis ID received:', result);
                    setUploadError('Analysis completed but no results available');
                }
            }, 1000);

        } catch (err) {
            console.error('Upload error:', err);
            setUploadError('Analysis failed: ' + err.message);
        } finally {
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] flex flex-col items-center justify-center text-white">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img src={logo} alt="Dermin Logo" className="w-32 h-32 opacity-80" />
                </motion.div>
                <p className="mt-4 text-lg text-[#90BE6D]">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] flex flex-col items-center justify-center text-white p-4">
                <AlertTriangle className="text-red-400 w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">An Error Occurred</h2>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (showSurvey) {
        return <SkinSurvey onComplete={handleSurveyComplete} userName={userName} />;
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Dermin Logo" className="w-12 h-12" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-100">
                                {userName ? `Welcome to Dermin, ${userName}!` : 'Welcome to Dermin!'}
                            </h1>
                            <p className="text-md text-[#90BE6D]">Ready for your skin analysis?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/analyses')}
                            className="p-2 rounded-full hover:bg-[#778DA9]/30 transition-colors"
                            title="Analiz Geçmişi"
                        >
                            <FileText className="text-gray-300" />
                        </button>
                        <button 
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-full hover:bg-[#778DA9]/30 transition-colors"
                        >
                            <SettingsIcon className="text-gray-300" />
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-[#132D46] border-2 border-[#778DA9]/80 rounded-full font-semibold hover:bg-[#778DA9]/30 transition-colors">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content: File Upload and Analysis */}
                <main className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl shadow-2xl p-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <UploadCloud className="mx-auto text-[#90BE6D] w-16 h-16 mb-4" />
                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Upload Your Skin Photo</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            For the best results, use a clear, well-lit photo of the area you want to analyze.
                        </p>

                        <div className="w-full max-w-lg mx-auto">
                            <label htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#778DA9]/60 rounded-lg hover:bg-[#132D46]/50 transition-colors">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText className="w-10 h-10 text-gray-500 mb-2" />
                                        <p className="text-lg font-semibold text-gray-300">Click to browse or drag & drop</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, or WEBP (Max 5MB)</p>
                                    </div>
                                )}
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                            </label>

                            {uploadError && <p className="mt-4 text-red-400 animate-pulse">{uploadError}</p>}
                            
                            {uploading && (
                                <div className="mt-4 w-full">
                                    <p className="text-lg text-[#90BE6D] mb-2">Analyzing your photo...</p>
                                    <div className="w-full bg-[#132D46] rounded-full h-2.5 border border-[#778DA9]/50">
                                        <motion.div
                                            className="bg-gradient-to-r from-[#778DA9] to-[#90BE6D] h-2.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                                    <CheckCircle />
                                    <p>Analysis complete! Redirecting to results...</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="mt-6 w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-full text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-5 h-5 bg-white rounded-full"
                                    />
                                ) : (
                                    'Start Analysis'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </main>
            </motion.div>

            {/* Settings Modal */}
            <Settings 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                currentUser={currentUser}
                onUserUpdate={handleUserUpdate}
            />
        </div>
    );
}

export default Dashboard;
