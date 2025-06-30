import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { useState, useEffect } from 'react'

function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [showSetPassword, setShowSetPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [codeSent, setCodeSent] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60)
    const [inlineError, setInlineError] = useState('')
    const [inlineSuccess, setInlineSuccess] = useState('')

    // Ensure consistent styles across animations
    const ensureIconColors = () => {
        const style = document.createElement('style')
        style.textContent = `
            .login-container input::placeholder {
                color: #8a8b9a !important;
                transition: color 0.3s ease !important;
            }
            .login-container .input-icon {
                color: #6a6b7a !important;
                transition: color 0.3s ease !important;
            }
            .login-container input:focus::placeholder {
                color: #9a9bb5 !important;
            }
            .login-container input:focus + .input-icon,
            .login-container input:focus ~ .input-icon {
                color: #6a6b7a !important;
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
            // geçici şifre ile user create dene
            const tempPassword = 'temp' + Math.random().toString(36).slice(-8)
            await createUserWithEmailAndPassword(auth, email, tempPassword)
            
            // başarılıysa yeni kullanıcı - set password moduna geç
            setShowSetPassword(true)
            
        } catch (error) {
            console.error('User creation test error:', error)
            
            if (error.code === 'auth/email-already-in-use') {
                // email kayıtlı - şifre giriş moduna geç
                setShowPasswordInput(true)
                setTimeout(() => ensureIconColors(), 100) // Re-apply styles after transition
            } else {
                // başka hata - set password moduna geç
                setShowSetPassword(true)
                setTimeout(() => ensureIconColors(), 100) // Re-apply styles after transition
            }
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

        try {
            // Önce geçici kullanıcıyı gerçek şifre ile güncelle
            if (auth.currentUser) {
                await deleteUser(auth.currentUser)
            }

            // Gerçek şifre ile kullanıcı oluştur
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            
            // Firebase email verification gönder
            await sendEmailVerification(userCredential.user)
            
            setCodeSent(true)
            setTimeLeft(60)
            showInlineSuccess('Verification email sent! Please check your inbox.')
            setTimeout(() => ensureIconColors(), 100) // Re-apply styles after transition
            
        } catch (error) {
            console.error('Error sending verification email:', error)
            showInlineError('Failed to send verification email. Please try again.')
        }
    }

    const resendEmail = async () => {
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser)
                setTimeLeft(60)
                showInlineSuccess('Verification email resent!')
            } catch (error) {
                console.error('Error resending email:', error)
                showInlineError('Failed to resend email. Please try again.')
            }
        }
    }

    const verifyCode = async () => {
        try {
            // Kullanıcının email'ini yeniden yükle
            await auth.currentUser.reload()
            
            if (auth.currentUser.emailVerified) {
                showInlineSuccess('Email verified successfully!')
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            } else {
                showInlineError('Email not verified yet. Please check your inbox and click the verification link.')
            }
        } catch (error) {
            console.error('Error checking verification:', error)
            showInlineError('Error checking verification status. Please try again.')
        }
    }

    const handlePasswordLogin = async () => {
        setLoading(true)
        setInlineError('')
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            
            // Email verify edilmiş mi kontrol et
            if (!userCredential.user.emailVerified) {
                // Email verify edilmemiş - verification akışına yönlendir
                setShowPasswordInput(false)
                setShowSetPassword(true)
                setCodeSent(true)
                setTimeLeft(60)
                showInlineError('Please verify your email address first. Check your inbox for the verification link.')
                setTimeout(() => ensureIconColors(), 100) // Re-apply styles after transition
                return
            }
            
            // Email verify edilmiş - dashboard'a git
            setTimeout(() => {
                navigate('/dashboard')
            }, 500)
        } catch (error) {
            console.error('Password login error:', error)
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                showInlineError('Incorrect password. Please try again.')
            } else {
                showInlineError('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        setGoogleLoading(true)
        try {
            const userCredential = await signInWithPopup(auth, provider)
            
            // Google hesapları genellikle otomatik verify edilir, ama kontrol edelim
            if (!userCredential.user.emailVerified) {
                // Email verify edilmemiş - verification göndermek gerek
                await sendEmailVerification(userCredential.user)
                setEmail(userCredential.user.email)
                setShowSetPassword(true)
                setCodeSent(true)
                setTimeLeft(60)
                showInlineError('Please verify your email address first. We sent you a verification email.')
                setTimeout(() => ensureIconColors(), 100) // Re-apply styles after transition
                return
            }
            
            // Email verify edilmiş - dashboard'a git
            setTimeout(() => {
                navigate('/dashboard')
            }, 500)
        } catch (error) {
            console.error('Google sign in error:', error)
            showInlineError('Google sign in failed. Please try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email)
            showInlineSuccess('Password reset email sent! Please check your inbox.')
        } catch (error) {
            console.error('Password reset error:', error)
            if (error.code === 'auth/user-not-found') {
                showInlineError('No account found with this email address.')
            } else {
                showInlineError('Failed to send password reset email. Please try again.')
            }
        }
    }

    const resetForm = () => {
        setShowPasswordInput(false)
        setShowSetPassword(false)
        setCodeSent(false)
        setPassword('')
        setConfirmPassword('')
        setVerificationCode('')
        setInlineError('')
        setInlineSuccess('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#d7d8e0] via-[#e6e7ed] to-[#d7d8e0] flex items-center justify-center relative">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20 w-[420px] max-w-md login-container">
                <h1 className="text-3xl font-bold text-[#5a5b6b] text-center mb-10 tracking-tight">
                    Dermin
                </h1>

                <div className="space-y-4">
                    {/* Global inline messages */}
                    {inlineError && (
                        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 px-5 py-4 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300 shadow-sm">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={18} />
                                <span className="font-medium">{inlineError}</span>
                            </div>
                        </div>
                    )}

                    {inlineSuccess && (
                        <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-emerald-700 px-5 py-4 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300 shadow-sm">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={18} />
                                <span className="font-medium">{inlineSuccess}</span>
                            </div>
                        </div>
                    )}

                    {/* Google buton - kayıtlı kullanıcı veya set password modunda gizle */}
                    <div className={`transition-all duration-700 ease-in-out ${showPasswordInput || showSetPassword ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-20'}`}>
                        <button 
                            onClick={handleGoogleSignIn} 
                            disabled={googleLoading}
                            className="w-full border border-[#c8c9d4]/40 text-[#5a5b6b] py-3 px-4 rounded-lg hover:bg-[#f5f5f8]/50 hover:border-[#c8c9d4]/60 flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer disabled:bg-[#f5f5f8]/30 disabled:cursor-not-allowed font-normal shadow-sm backdrop-blur-sm"
                        >
                            {googleLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-slate-600"></div>
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
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
                    <div className={`transition-all duration-700 ease-in-out ${showPasswordInput || showSetPassword ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-10'}`}>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#c8c9d4]/30" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white/90 backdrop-blur-sm px-4 text-[#7a7b8a] font-medium">OR</span>
                            </div>
                        </div>
                    </div>

                    {/* Email giriş formu */}
                    {!showPasswordInput && !showSetPassword && (
                        <form onSubmit={(e) => { e.preventDefault(); handleEmailContinue(); }} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] input-icon z-10" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-[#c8c9d4]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9a9bb5]/50 focus:border-[#9a9bb5]/60 transition-colors duration-300 bg-white/80 backdrop-blur-sm text-[#5a5b6b] placeholder:text-[#8a8b9a] font-normal shadow-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] text-white py-3 px-4 rounded-lg hover:from-[#7a7b8a] hover:to-[#8a8b9a] disabled:from-[#c8c9d4] disabled:to-[#d7d8e0] disabled:cursor-not-allowed transition-all duration-300 font-normal shadow-md backdrop-blur-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                        <span>Checking...</span>
                                    </div>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Şifre giriş alanı - kayıtlı kullanıcı için */}
                    <div className={`transition-all duration-700 ease-in-out ${showPasswordInput ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        <form onSubmit={(e) => { e.preventDefault(); handlePasswordLogin(); }} className="space-y-4">
                            <div className="text-center text-[#6a6b7a] text-sm mb-4 font-normal">
                                Welcome back! Enter your password for <strong className="text-[#5a5b6b]">{email}</strong>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] input-icon z-10" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 border border-[#c8c9d4]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9a9bb5]/50 focus:border-[#9a9bb5]/60 transition-colors duration-300 bg-white/80 backdrop-blur-sm text-[#5a5b6b] placeholder:text-[#8a8b9a] font-normal shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] hover:text-[#5a5b6b] transition-colors duration-200 z-10"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] text-white py-3 px-4 rounded-lg hover:from-[#7a7b8a] hover:to-[#8a8b9a] disabled:from-[#c8c9d4] disabled:to-[#d7d8e0] disabled:cursor-not-allowed transition-all duration-300 font-normal shadow-md backdrop-blur-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            <div className="flex justify-between items-center text-sm">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-[#7a7b8a] hover:text-[#6a6b7a] hover:bg-[#f5f5f8]/50 px-3 py-2 rounded-lg transition-all duration-200 font-normal"
                                >
                                    ← Back to login
                                </button>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[#8a8b9a] hover:text-[#7a7b8a] underline transition-colors duration-200 font-normal"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Şifre belirleme alanı - yeni kullanıcı için */}
                    <div className={`transition-all duration-700 ease-in-out ${showSetPassword ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        <div className={`space-y-4 ${showSetPassword ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300' : ''}`}>
                            {!codeSent ? (
                                <>
                                    <div className="text-center text-[#6a6b7a] text-sm mb-4 font-normal">
                                        Welcome! Please set your password for <strong className="text-[#5a5b6b]">{email}</strong>
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] input-icon z-10" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3 border border-[#c8c9d4]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9a9bb5]/50 focus:border-[#9a9bb5]/60 transition-colors duration-300 bg-white/80 backdrop-blur-sm text-[#5a5b6b] placeholder:text-[#8a8b9a] font-normal shadow-sm"
                                            required
                                            minLength="6"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] hover:text-[#5a5b6b] transition-colors duration-200 z-10"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6a6b7a] input-icon z-10" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-[#c8c9d4]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9a9bb5]/50 focus:border-[#9a9bb5]/60 transition-colors duration-300 bg-white/80 backdrop-blur-sm text-[#5a5b6b] placeholder:text-[#8a8b9a] font-normal shadow-sm"
                                            required
                                            minLength="6"
                                        />
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={sendVerificationCode}
                                            disabled={!password || !confirmPassword || loading}
                                            className="bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] text-white py-3 px-6 rounded-lg hover:from-[#7a7b8a] hover:to-[#8a8b9a] disabled:from-[#c8c9d4] disabled:to-[#d7d8e0] disabled:cursor-not-allowed transition-all duration-300 font-normal shadow-md backdrop-blur-sm"
                                        >
                                            Verify Email
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="text-[#7a7b8a] hover:text-[#6a6b7a] hover:bg-[#f5f5f8]/50 px-4 py-2 rounded-lg text-sm transition-all duration-200 font-normal"
                                        >
                                            ← Back to login
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center text-[#6a6b7a] text-sm mb-4 font-normal">
                                        We sent a verification email to <strong className="text-[#5a5b6b]">{email}</strong>
                                        <br />
                                        Please check your inbox and click the verification link.
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={verifyCode}
                                            className="bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] text-white py-3 px-6 rounded-lg hover:from-[#7a7b8a] hover:to-[#8a8b9a] transition-all duration-300 font-normal shadow-md backdrop-blur-sm"
                                        >
                                            I've Verified
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        {timeLeft > 0 ? (
                                            <p className="text-[#7a7b8a] text-sm font-normal">
                                                Resend email in {timeLeft}s
                                            </p>
                                        ) : (
                                            <button
                                                onClick={resendEmail}
                                                className="text-[#8a8b9a] hover:text-[#7a7b8a] text-sm underline transition-colors duration-200 font-normal"
                                            >
                                                Resend verification email
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={resetForm}
                                            className="text-[#7a7b8a] hover:text-[#6a6b7a] hover:bg-[#f5f5f8]/50 px-4 py-2 rounded-lg text-sm transition-all duration-200 font-normal"
                                        >
                                            ← Back to login
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
