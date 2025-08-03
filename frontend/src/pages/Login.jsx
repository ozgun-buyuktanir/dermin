import { Mail, Lock, Eye, EyeClosed, CheckCircle, XCircle, AlertCircle, AlertTriangle, Shield, FileText, ExternalLink, Sparkles, Brain, Camera, Microscope, Activity, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import authService from '../services/authService'
import logo from '../../dermin_logo.png';

function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [showSetPassword, setShowSetPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [codeSent, setCodeSent] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60)
    const [inlineError, setInlineError] = useState('')
    const [inlineSuccess, setInlineSuccess] = useState('')
    const [privacyAccepted, setPrivacyAccepted] = useState(false)
    const [showPrivacyModal, setShowPrivacyModal] = useState(false)

    // Intro animation states
    const [currentSlide, setCurrentSlide] = useState(0)
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const introSlides = [
        {
            icon: Microscope,
            text: "Advanced ",
            highlight: "AI-Powered",
            suffix: " skin analysis technology at your fingertips",
            gradient: "from-[#778DA9] via-[#90BE6D] to-[#778DA9]"
        },
        {
            icon: Activity,
            text: "Real-time ",
            highlight: "Health Monitoring",
            suffix: " for your skin wellness journey",
            gradient: "from-[#90BE6D] via-[#778DA9] to-[#90BE6D]"
        },
        {
            icon: Heart,
            text: "Personalized ",
            highlight: "Care Recommendations",
            suffix: " tailored specifically for you",
            gradient: "from-[#778DA9] via-[#90BE6D] to-[#778DA9]"
        }
    ]

    // Intro animation logic
    useEffect(() => {
        setIsTyping(true)
        setDisplayedText('')

        const slide = introSlides[currentSlide]
        const fullText = slide.text + slide.highlight + slide.suffix
        let index = 0

        const typeInterval = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayedText(fullText.slice(0, index))
                index++
            } else {
                setIsTyping(false)
                clearInterval(typeInterval)
                // Auto advance to next slide after 3 seconds
                setTimeout(() => {
                    setCurrentSlide((prev) => (prev + 1) % introSlides.length)
                }, 3000)
            }
        }, 50)

        return () => clearInterval(typeInterval)
    }, [currentSlide])

    // Ensure consistent styles across animations
    const ensureIconColors = () => {
        const style = document.createElement('style')
        style.textContent = `
            .login-container input::placeholder {
                color: #E0E1DD !important;
                opacity: 0.7 !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .login-container .input-icon {
                color: #778DA9 !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .login-container input:focus::placeholder {
                color: #E0E1DD !important;
                opacity: 0.5 !important;
            }
            .login-container input:focus + .input-icon,
            .login-container input:focus ~ .input-icon {
                color: #90BE6D !important;
                transform: scale(1.05) !important;
            }
            .dermin-gradient-text {
                background: linear-gradient(135deg, #778DA9, #90BE6D, #778DA9);
                background-size: 200% 200%;
                animation: gradientShift 3s ease infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .smooth-appear {
                animation: smoothAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                opacity: 0;
                transform: translateY(20px);
            }
            @keyframes smoothAppear {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .glow-effect {
                box-shadow: 0 0 20px rgba(119, 141, 169, 0.3);
                transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .glow-effect:hover {
                box-shadow: 0 0 30px rgba(119, 141, 169, 0.5);
            }
            /* Enhanced animations */
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.8s ease-out;
            }
            /* Custom scrollbar for privacy modal */
            .custom-scrollbar::-webkit-scrollbar {
                width: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(13, 27, 42, 0.8);
                border-radius: 8px;
                border: 1px solid rgba(119, 141, 169, 0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #778DA9, #90BE6D);
                border-radius: 8px;
                border: 2px solid rgba(27, 38, 59, 0.5);
                transition: all 0.3s ease;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #90BE6D, #778DA9);
                box-shadow: 0 0 15px rgba(119, 141, 169, 0.4);
                border: 2px solid rgba(144, 190, 109, 0.3);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:active {
                background: linear-gradient(135deg, #778DA9, #90BE6D);
                box-shadow: 0 0 20px rgba(119, 141, 169, 0.6);
            }
            .custom-scrollbar::-webkit-scrollbar-corner {
                background: rgba(13, 27, 42, 0.8);
            }
            /* Firefox scrollbar styling */
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #778DA9 rgba(13, 27, 42, 0.8);
            }
        `
        if (!document.head.querySelector('#login-styles')) {
            style.id = 'login-styles'
            document.head.appendChild(style)
        }
    }

    useEffect(() => {
        ensureIconColors()
        // Clean up on unmount
        return () => {
            const existingStyle = document.head.querySelector('#login-styles')
            if (existingStyle) {
                existingStyle.remove()
            }
        }
    }, [])

    useEffect(() => {
        let timer
        if (codeSent && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [codeSent, timeLeft])

    const showInlineError = (message) => {
        setInlineError(message)
        setInlineSuccess('')
        setTimeout(() => {
            setInlineError('')
        }, 4000)
    }

    const showInlineSuccess = (message) => {
        setInlineSuccess(message)
        setInlineError('')
        setTimeout(() => {
            setInlineSuccess('')
        }, 4000)
    }

    const handleEmailContinue = async () => {
        setLoading(true)

        try {
            // Check if user exists with the new endpoint
            const userExists = await authService.checkUserExists(email)

            if (userExists) {
                // User exists, show password input
                setShowPasswordInput(true)
                setTimeout(() => ensureIconColors(), 100)
            } else {
                // User doesn't exist, show registration form
                setShowSetPassword(true)
                setTimeout(() => ensureIconColors(), 100)
            }
        } catch (error) {
            console.error('Email check error:', error)
            showInlineError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const sendVerificationCode = async () => {
        if (!password || !confirmPassword) {
            showInlineError('Please enter both passwords.')
            return
        }

        if (password !== confirmPassword) {
            showInlineError('Passwords do not match.')
            return
        }

        if (password.length < 6) {
            showInlineError('Password must be at least 6 characters long.')
            return
        }

        if (!privacyAccepted) {
            showInlineError('Please accept the privacy policy to continue.')
            return
        }

        try {
            // Register new user with backend
            await authService.register(email, password)

            setCodeSent(true)
            setTimeLeft(60)
            showInlineSuccess('Account created successfully! You are now logged in.')
            setTimeout(() => {
                navigate('/dashboard')
            }, 1500)

        } catch (error) {
            console.error('Registration error:', error)
            showInlineError(error.message || 'Registration failed. Please try again.')
        }
    }

    const resendEmail = async () => {
        // Since we're using backend auth without email verification,
        // this function is not needed but kept for UI compatibility
        showInlineError('Email verification is not required with our new system.')
    }

    const verifyCode = async () => {
        // Since registration now directly logs in the user,
        // this function redirects to dashboard
        showInlineSuccess('Welcome! Redirecting to dashboard...')
        setTimeout(() => {
            navigate('/dashboard')
        }, 1000)
    }

    const handlePasswordLogin = async () => {
        setLoading(true)
        setInlineError('')
        try {
            // Login with backend
            await authService.login(email, password)

            showInlineSuccess('Login successful!')
            setTimeout(() => {
                navigate('/dashboard')
            }, 500)
        } catch (error) {
            console.error('Password login error:', error)
            if (error.message.includes('Invalid email or password')) {
                showInlineError('Incorrect email or password. Please try again.')
            } else {
                showInlineError('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        // Google Sign In is not implemented in backend yet
        setGoogleLoading(true)
        setTimeout(() => {
            showInlineError('Google Sign In will be available soon. Please use email registration.')
            setGoogleLoading(false)
        }, 1000)
    }

    const handleForgotPassword = async () => {
        try {
            await authService.sendPasswordResetEmail(email)
            showInlineSuccess('Password reset email sent! Please check your inbox.')
        } catch (error) {
            console.error('Password reset error:', error)
            showInlineError('Password reset will be available soon. Please contact support.')
        }
    }

    const resetForm = () => {
        setShowPasswordInput(false)
        setShowSetPassword(false)
        setCodeSent(false)
        setPassword('')
        setConfirmPassword('')
        setInlineError('')
        setInlineSuccess('')
        setPrivacyAccepted(false)
        setShowPrivacyModal(false)
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] flex relative overflow-hidden">
                {/* Unified seamless background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/90 via-[#1B263B]/70 to-[#0D1B2A]/90 backdrop-blur-sm"></div>
                
                {/* Subtle animated background particles */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-[#778DA9]/30 to-[#90BE6D]/30 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-[#90BE6D]/30 to-[#778DA9]/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-[#778DA9]/20 to-[#90BE6D]/20 rounded-full blur-xl animate-pulse delay-500"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-gradient-to-r from-[#90BE6D]/25 to-[#778DA9]/25 rounded-full blur-xl animate-pulse delay-700"></div>
                </div>
                
                {/* Left Side - Login Form */}
                <div className="w-1/2 flex items-center justify-center p-8 relative z-10">

                    <div className="bg-[#1B263B]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-[#778DA9]/20 w-full max-w-md login-container relative z-10 glow-effect smooth-appear">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 hover:scale-105">
                                <img src={logo} alt="Dermin Logo" className="w-10 h-10 filter brightness-0 invert" />
                            </div>
                            <h1 className="text-2xl font-light text-[#E0E1DD] mb-2">
                                Welcome to <span className="dermin-gradient-text font-medium">Dermin</span>
                            </h1>
                            <p className="text-[#E0E1DD]/70 text-xs">Advanced AI-powered skin analysis platform</p>
                        </div>

                        <div className="space-y-3">
                            {/* Global inline messages */}
                            {inlineError && (
                                <div className="bg-[#F94144]/10 backdrop-blur-sm border border-[#F94144]/30 text-[#F94144] px-5 py-4 rounded-xl text-sm animate-in slide-in-from-top-2 duration-500 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} />
                                        <span className="font-medium">{inlineError}</span>
                                    </div>
                                </div>
                            )}

                            {inlineSuccess && (
                                <div className="bg-[#90BE6D]/10 backdrop-blur-sm border border-[#90BE6D]/30 text-[#90BE6D] px-5 py-4 rounded-xl text-sm animate-in slide-in-from-top-2 duration-500 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">{inlineSuccess}</span>
                                    </div>
                                </div>
                            )}

                            {/* Google buton - kayıtlı kullanıcı veya set password modunda gizle */}
                            <div className={`transition-all duration-700 ease-in-out ${showPasswordInput || showSetPassword ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-16'}`}>
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading}
                                    className="w-full border border-[#778DA9]/30 text-[#E0E1DD] py-2.5 px-4 rounded-xl hover:bg-[#778DA9]/10 hover:border-[#778DA9]/50 flex items-center justify-center gap-3 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer disabled:bg-[#1B263B]/30 disabled:cursor-not-allowed font-light shadow-lg backdrop-blur-sm group"
                                >
                                    {googleLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#778DA9]/30 border-t-[#778DA9]"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="transition-transform duration-300 group-hover:scale-110">
                                                <path fill="#EA4335" d="M24 9.5c3.31 0 6.28 1.14 8.6 3.01l6.4-6.4C34.13 2.77 29.35 1 24 1 14.94 1 7.23 6.52 3.98 14.02l7.53 5.84C13.11 14.27 18.17 9.5 24 9.5z" />
                                                <path fill="#4285F4" d="M46.14 24.49c0-1.63-.14-3.21-.4-4.74H24v9h12.41c-.53 2.84-2.17 5.24-4.56 6.86l7.14 5.57c4.17-3.84 6.55-9.5 6.55-16.69z" />
                                                <path fill="#FBBC05" d="M11.51 28.49a14.5 14.5 0 0 1 0-9l-7.53-5.84A23.973 23.973 0 0 0 0 24c0 3.84.92 7.45 2.54 10.66l8.97-7.17z" />
                                                <path fill="#34A853" d="M24 48c6.48 0 11.91-2.14 15.88-5.82l-7.14-5.57c-2.03 1.37-4.64 2.19-8.74 2.19-5.83 0-10.89-4.77-12.5-11.36l-8.97 7.17C7.23 41.48 14.94 48 24 48z" />
                                                <path fill="none" d="M0 0h48v48H0z" />
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* OR divider - set password modunda gizle */}
                            <div className={`transition-all duration-700 ease-in-out ${showPasswordInput || showSetPassword ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-8'}`}>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-[#778DA9]/20" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-[#1B263B] px-3 text-[#E0E1DD]/60 font-light">OR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email giriş formu */}
                            {!showPasswordInput && !showSetPassword && (
                                <form onSubmit={(e) => { e.preventDefault(); handleEmailContinue(); }} className="space-y-3">
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] input-icon z-10 transition-all duration-300" size={16} />
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-[#778DA9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#90BE6D]/50 focus:border-[#90BE6D]/60 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#0D1B2A]/30 backdrop-blur-sm text-[#E0E1DD] placeholder:text-[#E0E1DD]/50 font-light shadow-lg text-sm"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-[#0D1B2A] py-2.5 px-4 rounded-xl hover:from-[#90BE6D] hover:to-[#778DA9] disabled:from-[#778DA9]/50 disabled:to-[#90BE6D]/50 disabled:cursor-not-allowed transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) font-medium shadow-lg backdrop-blur-sm group transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A]"></div>
                                                <span>Checking...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Continue
                                                <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Şifre giriş alanı - kayıtlı kullanıcı için */}
                            <div className={`transition-all duration-700 ease-in-out ${showPasswordInput ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                <form onSubmit={(e) => { e.preventDefault(); handlePasswordLogin(); }} className="space-y-3">
                                    <div className="text-center text-[#E0E1DD]/70 text-xs mb-3 font-light">
                                        Welcome back! Enter your password for <strong className="text-[#90BE6D]">{email}</strong>
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] input-icon z-10 transition-all duration-300" size={16} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-11 py-2.5 border border-[#778DA9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#90BE6D]/50 focus:border-[#90BE6D]/60 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#0D1B2A]/30 backdrop-blur-sm text-[#E0E1DD] placeholder:text-[#E0E1DD]/50 font-light shadow-lg text-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] hover:text-[#90BE6D] transition-all duration-300 z-10 hover:scale-110"
                                        >
                                            {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-[#0D1B2A] py-2.5 px-4 rounded-xl hover:from-[#90BE6D] hover:to-[#778DA9] disabled:from-[#778DA9]/50 disabled:to-[#90BE6D]/50 disabled:cursor-not-allowed transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) font-medium shadow-lg backdrop-blur-sm group transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A]"></div>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Sign In
                                                <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex justify-between items-center text-xs">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#778DA9]/10 px-3 py-2 rounded-lg transition-all duration-300 font-light group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Back
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#778DA9]/10 px-3 py-2 rounded-lg transition-all duration-300 font-light"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Şifre oluşturma alanı - yeni kullanıcı için */}
                            <div className={`transition-all duration-700 ease-in-out ${showSetPassword ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                <div className={`space-y-3 ${showSetPassword ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300' : ''}`}>
                                    {!codeSent ? (
                                        <>
                                            <div className="text-center text-[#E0E1DD]/70 text-xs mb-3 font-light">
                                                Welcome! Please set your password for <strong className="text-[#90BE6D]">{email}</strong>
                                            </div>

                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] input-icon z-10 transition-all duration-300" size={16} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Create password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-11 py-2.5 border border-[#778DA9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#90BE6D]/50 focus:border-[#90BE6D]/60 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#0D1B2A]/30 backdrop-blur-sm text-[#E0E1DD] placeholder:text-[#E0E1DD]/50 font-light shadow-lg text-sm"
                                                    required
                                                    minLength="6"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] hover:text-[#90BE6D] transition-all duration-300 z-10 hover:scale-110"
                                                >
                                                    {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>

                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#778DA9] input-icon z-10 transition-all duration-300" size={16} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Confirm password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-[#778DA9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#90BE6D]/50 focus:border-[#90BE6D]/60 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#0D1B2A]/30 backdrop-blur-sm text-[#E0E1DD] placeholder:text-[#E0E1DD]/50 font-light shadow-lg text-sm"
                                                    required
                                                    minLength="6"
                                                />
                                            </div>

                                            {/* Privacy Checkbox - Compact */}
                                            <div className="flex items-center space-x-2 p-3 bg-[#0D1B2A]/20 rounded-xl border border-[#778DA9]/10">
                                                <input
                                                    type="checkbox"
                                                    id="privacy-checkbox-signup"
                                                    checked={privacyAccepted}
                                                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                                    className="w-3 h-3 text-[#90BE6D] bg-[#1B263B] border-[#778DA9] rounded focus:ring-[#90BE6D] focus:ring-2"
                                                />
                                                <label htmlFor="privacy-checkbox-signup" className="text-xs text-[#E0E1DD]/70 cursor-pointer font-light">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPrivacyModal(true)}
                                                        className="text-[#90BE6D] hover:text-[#778DA9] underline transition-colors duration-300"
                                                    >
                                                        privacy policy
                                                    </button>
                                                    {' '}and data processing terms
                                                </label>
                                            </div>

                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={sendVerificationCode}
                                                    disabled={!password || !confirmPassword || loading || !privacyAccepted}
                                                    className="bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-[#0D1B2A] py-2.5 px-6 rounded-xl hover:from-[#90BE6D] hover:to-[#778DA9] disabled:from-[#778DA9]/50 disabled:to-[#90BE6D]/50 disabled:cursor-not-allowed transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) font-medium shadow-lg backdrop-blur-sm group transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        Create Account
                                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    className="text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#778DA9]/10 px-3 py-2 rounded-lg text-xs transition-all duration-300 font-light group"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Back to login
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center text-[#E0E1DD]/70 text-xs mb-3 font-light">
                                                Account created successfully! <strong className="text-[#90BE6D]">{email}</strong>
                                                <br />
                                                You will be redirected to the dashboard shortly.
                                            </div>

                                            <div className="flex justify-center">
                                                <button
                                                    onClick={verifyCode}
                                                    className="bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-[#0D1B2A] py-2.5 px-6 rounded-xl hover:from-[#90BE6D] hover:to-[#778DA9] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) font-medium shadow-lg backdrop-blur-sm group transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        Go to Dashboard
                                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="text-center">
                                                <button
                                                    onClick={resetForm}
                                                    className="text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#778DA9]/10 px-3 py-2 rounded-lg text-xs transition-all duration-300 font-light group"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Back to login
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div> {/* <--- DÜZELTİLEN YER: SOL TARAFIN DIV'İ BURADA KAPANIYOR. */}

                {/* Right Side - Animated Intro */}
                <div className="w-1/2 flex items-center justify-center p-8 relative z-10">
                    {/* Enhanced animated background elements */}
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-[#778DA9]/30 to-[#90BE6D]/30 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-r from-[#90BE6D]/30 to-[#778DA9]/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-[#778DA9]/25 to-[#90BE6D]/25 rounded-full blur-xl animate-pulse delay-500"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-18 h-18 bg-gradient-to-r from-[#90BE6D]/25 to-[#778DA9]/25 rounded-full blur-xl animate-pulse delay-700"></div>
                    </div>

                    <div className="text-center max-w-lg relative z-10 w-full">
                        {/* Enhanced icon container with more effects */}
                        <div className="mb-8 relative">
                            {(() => {
                                const slide = introSlides[currentSlide]
                                const IconComponent = slide.icon
                                return (
                                    <div className="relative group">
                                        {/* Glowing background ring */}
                                        <div className={`absolute inset-0 w-24 h-24 bg-gradient-to-r ${slide.gradient} rounded-3xl mx-auto blur-md opacity-75 group-hover:opacity-100 transition-all duration-1000 animate-pulse`}></div>
                                        
                                        {/* Main icon container */}
                                        <div className={`relative w-24 h-24 bg-gradient-to-r ${slide.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform transition-all duration-1000 ease-out group-hover:shadow-[0_0_40px_rgba(119,141,169,0.5)]`}>
                                            <IconComponent className="w-12 h-12 text-[#0D1B2A] transition-all duration-500" />
                                        </div>
                                        
                                        {/* Floating particles around icon */}
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#90BE6D] rounded-full animate-ping opacity-60"></div>
                                        <div className="absolute bottom-2 left-2 w-1 h-1 bg-[#778DA9] rounded-full animate-ping opacity-50 delay-500"></div>
                                        <div className="absolute top-1/2 right-0 w-0.5 h-0.5 bg-[#90BE6D] rounded-full animate-ping opacity-40 delay-1000"></div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Enhanced text display area */}
                        <div className="min-h-[200px] flex flex-col items-center justify-center relative">
                            {/* Subtle decorative lines */}
                            <div className="absolute -top-4 left-1/4 w-16 h-px bg-gradient-to-r from-transparent via-[#90BE6D]/60 to-transparent"></div>
                            <div className="absolute -bottom-4 right-1/4 w-20 h-px bg-gradient-to-r from-transparent via-[#90BE6D]/60 to-transparent"></div>
                            <div className="absolute top-1/2 -left-8 w-12 h-px bg-gradient-to-r from-transparent via-[#90BE6D]/40 to-transparent transform rotate-90"></div>
                            <div className="absolute top-1/2 -right-8 w-12 h-px bg-gradient-to-r from-transparent via-[#90BE6D]/40 to-transparent transform rotate-90"></div>
                            
                            {/* Main animated text - no background glow */}
                            <div className="text-[#E0E1DD] text-2xl leading-relaxed mb-6 font-light relative">
                                <div className="relative p-4">
                                    {(() => {
                                        const slide = introSlides[currentSlide]
                                        const textBeforeHighlight = slide.text
                                        const highlightText = slide.highlight
                                        const textAfterHighlight = slide.suffix

                                        const currentIndex = displayedText.length
                                        const highlightStartIndex = textBeforeHighlight.length
                                        const highlightEndIndex = highlightStartIndex + highlightText.length

                                        return (
                                            <span>
                                                {displayedText.slice(0, highlightStartIndex)}
                                                {currentIndex > highlightStartIndex && (
                                                    <span className={`font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                                                        {displayedText.slice(highlightStartIndex, Math.min(currentIndex, highlightEndIndex))}
                                                    </span>
                                                )}
                                                {currentIndex > highlightEndIndex && (
                                                    <span>{displayedText.slice(highlightEndIndex)}</span>
                                                )}
                                                {isTyping && <span className="animate-pulse text-[#90BE6D] text-3xl font-bold ml-1">|</span>}
                                            </span>
                                        )
                                    })()}
                                </div>
                            </div>

                            {/* Description - only show when typing is complete */}
                            {!isTyping && (
                                <div className="relative animate-fade-in">
                                    <div className="text-[#E0E1DD]/80 text-sm leading-relaxed max-w-md text-center font-light p-4 border border-[#778DA9]/20 rounded-xl backdrop-blur-sm bg-[#1B263B]/30">
                                        <span className="block">
                                            Transform your skincare journey with cutting-edge AI technology designed for precision and personalized care.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced slide indicators */}
                        <div className="flex justify-center space-x-3 mt-8">
                            {introSlides.map((_, index) => (
                                <div
                                    key={index}
                                    className={`relative transition-all duration-500 cursor-pointer group ${
                                        index === currentSlide
                                            ? 'w-8 h-2 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-full'
                                            : 'w-2 h-2 bg-[#778DA9]/40 hover:bg-[#778DA9]/60 rounded-full'
                                    }`}
                                    onClick={() => setCurrentSlide(index)}
                                >
                                    {/* Active indicator glow effect */}
                                    {index === currentSlide && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-full blur-sm opacity-75 animate-pulse"></div>
                                    )}
                                    
                                    {/* Hover effect for inactive indicators */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#778DA9]/20 to-[#90BE6D]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                </div>
                            ))}
                        </div>

                        {/* Floating action elements */}
                        <div className="absolute bottom-8 right-8 opacity-40">
                            <div className="flex flex-col space-y-2">
                                <div className="w-0.5 h-0.5 bg-[#90BE6D] rounded-full animate-ping delay-300"></div>
                                <div className="w-1 h-1 bg-[#778DA9] rounded-full animate-ping delay-700"></div>
                                <div className="w-0.5 h-0.5 bg-[#90BE6D] rounded-full animate-ping delay-1000"></div>
                            </div>
                        </div>

                        {/* Floating elements on the left */}
                        <div className="absolute top-12 left-8 opacity-30">
                            <div className="flex space-x-2">
                                <div className="w-1 h-1 bg-[#778DA9] rounded-full animate-bounce delay-500"></div>
                                <div className="w-0.5 h-0.5 bg-[#90BE6D] rounded-full animate-bounce delay-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> {/* <--- ANA FLEX CONTAINER'IN DIV'İ BURADA KAPANIYOR. */}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 bg-[#0D1B2A]/80 backdrop-blur-lg flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1B263B]/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#778DA9]/20 custom-scrollbar">
                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Shield className="w-8 h-8 text-[#0D1B2A]" />
                                </div>
                                <h2 className="text-3xl font-light text-[#E0E1DD] mb-2">Privacy & Data Processing</h2>
                                <p className="text-[#E0E1DD]/70">Your privacy is important to us</p>
                            </div>

                            {/* Privacy Content */}
                            <div className="space-y-6 text-sm text-[#E0E1DD]/80">
                                <div>
                                    <h4 className="font-medium text-[#E0E1DD] mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#90BE6D]" />
                                        Data Collection
                                    </h4>
                                    <div className="bg-[#0D1B2A]/30 rounded-xl p-4 border border-[#778DA9]/10">
                                        <ul className="space-y-2">
                                            <li>• <strong className="text-[#90BE6D]">Skin Images:</strong> Photos you upload for AI analysis</li>
                                            <li>• <strong className="text-[#90BE6D]">Account Info:</strong> Email address, name, and preferences</li>
                                            <li>• <strong className="text-[#90BE6D]">Analysis History:</strong> Results and recommendations from previous analyses</li>
                                            <li>• <strong className="text-[#90BE6D]">Technical Data:</strong> Device information for service optimization</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-[#E0E1DD] mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-[#90BE6D]" />
                                        How We Use Your Data
                                    </h4>
                                    <div className="bg-[#0D1B2A]/30 rounded-xl p-4 border border-[#778DA9]/10">
                                        <ul className="space-y-2">
                                            <li>• <strong className="text-[#90BE6D]">AI Analysis:</strong> Process skin images to provide personalized recommendations</li>
                                            <li>• <strong className="text-[#90BE6D]">Service Improvement:</strong> Enhance AI accuracy and user experience</li>
                                            <li>• <strong className="text-[#90BE6D]">History Tracking:</strong> Maintain your analysis history for progress monitoring</li>
                                            <li>• <strong className="text-[#90BE6D]">Support:</strong> Provide technical assistance when needed</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-[#E0E1DD] mb-3 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-[#90BE6D]" />
                                        Data Protection
                                    </h4>
                                    <div className="bg-[#0D1B2A]/30 rounded-xl p-4 border border-[#778DA9]/10">
                                        <ul className="space-y-2">
                                            <li>• <strong className="text-[#90BE6D]">Encryption:</strong> All data encrypted in transit and at rest</li>
                                            <li>• <strong className="text-[#90BE6D]">Access Control:</strong> Strict access limitations to authorized personnel only</li>
                                            <li>• <strong className="text-[#90BE6D]">No Sharing:</strong> Your personal data is never shared with third parties</li>
                                            <li>• <strong className="text-[#90BE6D]">Data Rights:</strong> You can request data deletion at any time</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#778DA9]/20">
                                    <p className="text-xs text-[#E0E1DD]/50 text-center font-light">
                                        By continuing, you consent to the collection and processing of your personal data as described above.
                                        This consent is required for the AI skin analysis service to function properly.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <button
                                    onClick={() => setShowPrivacyModal(false)}
                                    className="flex-1 px-6 py-3 text-[#E0E1DD] hover:text-[#90BE6D] border border-[#778DA9]/30 hover:border-[#778DA9]/50 rounded-xl transition-all duration-300 font-light"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setPrivacyAccepted(true)
                                        setShowPrivacyModal(false)
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] hover:from-[#90BE6D] hover:to-[#778DA9] text-[#0D1B2A] rounded-xl transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Accept & Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )

}

export default Login