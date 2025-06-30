import { useState, useEffect } from 'react'
import { ArrowRight, User } from 'lucide-react'

const IntroPage = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [userName, setUserName] = useState('')
    const [showNameInput, setShowNameInput] = useState(false)
    const [fadeOut, setFadeOut] = useState(false)

    const slides = [
        { text: "Welcome to ", highlight: "Dermin AI", color: "from-blue-500 to-purple-600" },
        { text: "", highlight: "Dermin", color: "from-green-500 to-blue-500", suffix: " is your intelligent skin analysis assistant." },
        "Upload photos of your skin concerns for AI-powered insights.",
        "Get quick, informative guidance about potential skin conditions.",
        "We provide information only - consult a doctor for medical diagnosis.",
        "Ready to analyze your skin health?"
    ]

    useEffect(() => {
        if (currentSlide < slides.length) {
            setIsTyping(true)
            setDisplayedText('')
            
            const slide = slides[currentSlide]
            const text = typeof slide === 'string' ? slide : (slide.text + slide.highlight + (slide.suffix || ''))
            let index = 0
            
            const typeInterval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayedText(text.slice(0, index))
                    index++
                } else {
                    setIsTyping(false)
                    clearInterval(typeInterval)
                }
            }, 50) // Typing speed

            return () => clearInterval(typeInterval)
        } else {
            // All slides completed, show name input
            setShowNameInput(true)
        }
    }, [currentSlide])

    const handleNext = () => {
        if (!isTyping && currentSlide < slides.length - 1) {
            setFadeOut(true)
            setTimeout(() => {
                setCurrentSlide(currentSlide + 1)
                setFadeOut(false)
            }, 300)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            handleNext()
        }
    }

    const handleNameSubmit = () => {
        if (userName.trim()) {
            localStorage.setItem('dermin_user_name', userName.trim())
            onComplete(userName.trim())
        }
    }

    const handleNameKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleNameSubmit()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [isTyping, currentSlide])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                {!showNameInput ? (
                    <div className="text-center">
                        {/* Progress indicator */}
                        <div className="flex justify-center mb-16">
                            <div className="flex space-x-3">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            index <= currentSlide
                                                ? 'bg-gradient-to-r from-gray-600 to-gray-800 w-12'
                                                : 'bg-gray-400/50 w-3'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Main content */}
                        <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                            <div className="min-h-[250px] flex flex-col items-center justify-center">
                                <h1 className="text-5xl md:text-7xl font-light text-gray-700 leading-relaxed max-w-4xl text-center">
                                    {(() => {
                                        const slide = slides[currentSlide]
                                        if (typeof slide === 'string') {
                                            return (
                                                <>
                                                    {displayedText}
                                                    {isTyping && (
                                                        <span className="animate-pulse text-gray-500">|</span>
                                                    )}
                                                </>
                                            )
                                        } else {
                                            const { text, highlight, color, suffix = '' } = slide
                                            const fullText = text + highlight + suffix
                                            const highlightStart = text.length
                                            const highlightEnd = text.length + highlight.length
                                            
                                            return (
                                                <>
                                                    {displayedText.slice(0, highlightStart)}
                                                    {displayedText.length > highlightStart && (
                                                        <span className={`bg-gradient-to-r ${color} bg-clip-text text-transparent font-medium`}>
                                                            {displayedText.slice(highlightStart, Math.min(displayedText.length, highlightEnd))}
                                                        </span>
                                                    )}
                                                    {displayedText.length > highlightEnd && displayedText.slice(highlightEnd)}
                                                    {isTyping && (
                                                        <span className="animate-pulse text-gray-500">|</span>
                                                    )}
                                                </>
                                            )
                                        }
                                    })()}
                                </h1>
                                
                                {/* Next button - positioned below text */}
                                {!isTyping && currentSlide < slides.length - 1 && (
                                    <button
                                        onClick={handleNext}
                                        className="mt-8 group animate-fade-in"
                                    >
                                        <ArrowRight className="w-8 h-8 text-gray-500 hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300 transform hover:scale-110" />
                                    </button>
                                )}
                            </div>

                            {/* Last slide - I'm Ready button */}
                            {!isTyping && currentSlide === slides.length - 1 && (
                                <div className="mt-12 animate-fade-in">
                                    <button
                                        onClick={() => {
                                            setFadeOut(true)
                                            setTimeout(() => {
                                                setShowNameInput(true)
                                                setFadeOut(false)
                                            }, 300)
                                        }}
                                        className="px-8 py-3 text-lg font-light text-gray-600 hover:text-gray-800 border-b-2 border-gray-300 hover:border-gray-600 transition-all duration-300 bg-transparent"
                                    >
                                        I'm Ready
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center max-w-md mx-auto">
                        <div className="mb-12">
                            <div className="w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border border-gray-300/50">
                                <User className="w-12 h-12 text-gray-600" />
                            </div>
                            <h2 className="text-4xl font-light text-gray-700 mb-6">
                                What should I call you?
                            </h2>
                            <p className="text-gray-500 text-lg font-light">
                                I'd love to personalize your experience
                            </p>
                        </div>

                        <div className="mb-8 relative">
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyPress={handleNameKeyPress}
                                placeholder="Enter your name"
                                className="w-full px-6 py-4 pr-12 text-xl text-center border-0 border-b-2 border-gray-300 focus:border-gray-600 focus:outline-none transition-colors duration-300 bg-transparent placeholder-gray-400 font-light"
                                autoFocus
                            />
                            <button
                                onClick={handleNameSubmit}
                                disabled={!userName.trim()}
                                className="absolute right-0 bottom-4 group transition-all duration-300 transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IntroPage
