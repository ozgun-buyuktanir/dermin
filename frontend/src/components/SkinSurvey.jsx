import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, User, Calendar, Users, Droplet, AlertCircle, Sun, Zap, Utensils, Coffee, Cigarette, Heart, Stethoscope } from 'lucide-react'

const SkinSurvey = ({ onComplete, userName }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const questions = [
        {
            id: 'name',
            title: 'What is your name? (optional)',
            type: 'text',
            required: false,
            placeholder: 'Enter your name',
            icon: User,
            defaultValue: userName || ''
        },
        {
            id: 'age',
            title: 'What is your age?',
            type: 'number',
            required: true,
            placeholder: 'Enter your age',
            icon: Calendar,
            validation: { min: 1, max: 120 }
        },
        {
            id: 'gender',
            title: 'What is your gender?',
            type: 'radio',
            required: true,
            icon: Users,
            options: ['Female', 'Male', 'Prefer not to say']
        },
        {
            id: 'skin_type',
            title: 'What is your skin type?',
            type: 'radio',
            required: true,
            icon: Droplet,
            options: ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive']
        },
        {
            id: 'facial_conditions',
            title: 'Which facial conditions do you experience?',
            type: 'checkbox',
            required: false,
            icon: AlertCircle,
            options: ['Acne', 'Blackheads', 'Redness', 'Flaking', 'Eczema', 'Other']
        },
        {
            id: 'sun_sensitivity',
            title: 'Is your skin sensitive to sun light?',
            type: 'radio',
            required: true,
            icon: Sun,
            options: ['Yes', 'No', 'Not sure']
        },
        {
            id: 'physical_sensitivity',
            title: 'Is your skin sensitive to physical impact (e.g., scratching, rubbing, or minor pressure)?',
            type: 'radio',
            required: true,
            icon: Zap,
            options: ['Yes', 'Mildly sensitive', 'No']
        },
        {
            id: 'itching',
            title: 'Do you experience itching?',
            type: 'radio',
            required: true,
            icon: AlertCircle,
            options: ['Yes', 'No', 'Occasionally']
        },
        {
            id: 'allergies',
            title: 'Do you have any allergies?',
            type: 'radio',
            required: true,
            icon: Heart,
            options: ['Yes', 'No', 'Not sure']
        },
        {
            id: 'hair_type',
            title: 'What is your hair type?',
            type: 'radio',
            required: true,
            icon: Droplet,
            options: ['Oily', 'Dry', 'Normal']
        },
        {
            id: 'hair_issues',
            title: 'Which hair or scalp issues do you experience?',
            type: 'checkbox',
            required: false,
            icon: AlertCircle,
            options: ['Dandruff', 'Itching', 'Hair loss', 'Redness', 'Eczema', 'Other']
        },
        {
            id: 'diet_type',
            title: 'What is your diet type?',
            type: 'radio',
            required: true,
            icon: Utensils,
            options: ['Regular', 'Vegetarian', 'Vegan', 'Ketogenic', 'Other']
        },
        {
            id: 'water_intake',
            title: 'How much water do you drink daily?',
            type: 'radio',
            required: true,
            icon: Droplet,
            options: ['Less than 1 liter', '1–2 liters', '2–3 liters', 'More than 3 liters']
        },
        {
            id: 'exercise_frequency',
            title: 'In a typical week, how many days do you exercise?',
            type: 'radio',
            required: true,
            icon: Heart,
            options: ['I don\'t regularly exercise', 'Once a week', '2 to 4 days a week', '5 to 7 days a week']
        },
        {
            id: 'alcohol_consumption',
            title: 'About how many alcoholic drinks do you have each week?',
            type: 'number',
            required: false,
            placeholder: 'Enter number of drinks',
            icon: Coffee,
            validation: { min: 0, max: 100 }
        },
        {
            id: 'smoking_habits',
            title: 'About how many cigarettes do you smoke in a typical day?',
            type: 'number',
            required: false,
            placeholder: 'Enter number of cigarettes',
            icon: Cigarette,
            validation: { min: 0, max: 100 }
        },
        {
            id: 'chronic_illness',
            title: 'Do you have any chronic illnesses?',
            type: 'radio',
            required: true,
            icon: Stethoscope,
            options: ['Yes', 'No']
        },
        {
            id: 'regular_medications',
            title: 'Do you take any regular medications?',
            type: 'radio',
            required: true,
            icon: Heart,
            options: ['Yes', 'No']
        },
        {
            id: 'dermatologist_visit',
            title: 'Have you visited a dermatologist before?',
            type: 'radio',
            required: true,
            icon: Stethoscope,
            options: ['Yes', 'No']
        }
    ]

    const currentQuestion = questions[currentStep]
    const totalSteps = questions.length
    const progress = ((currentStep + 1) / totalSteps) * 100

    const handleAnswerChange = (value) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }))
    }

    const handleCheckboxChange = (option) => {
        const currentAnswers = answers[currentQuestion.id] || []
        const newAnswers = currentAnswers.includes(option)
            ? currentAnswers.filter(item => item !== option)
            : [...currentAnswers, option]
        
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: newAnswers
        }))
    }

    const isCurrentStepValid = () => {
        const answer = answers[currentQuestion.id]
        
        if (!currentQuestion.required) return true
        
        if (currentQuestion.type === 'checkbox') {
            return answer && answer.length > 0
        }
        
        return answer !== undefined && answer !== '' && answer !== null
    }

    const handleNext = () => {
        if (isCurrentStepValid() && currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!isCurrentStepValid()) return

        setIsSubmitting(true)
        
        try {
            // Create survey response
            const surveyResponse = {
                ...answers,
                timestamp: new Date().toISOString(),
                version: '1.0'
            }

            // Save to backend
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/surveys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(surveyResponse)
            })

            if (response.ok) {
                // Mark survey as completed
                localStorage.setItem('dermin_survey_completed', 'true')
                onComplete(surveyResponse)
            } else {
                console.error('Failed to save survey')
                // Still mark as completed locally for now
                localStorage.setItem('dermin_survey_completed', 'true')
                onComplete(surveyResponse)
            }
        } catch (error) {
            console.error('Survey submission error:', error)
            // Still mark as completed locally for now
            localStorage.setItem('dermin_survey_completed', 'true')
            onComplete(surveyResponse)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderQuestionInput = () => {
        const IconComponent = currentQuestion.icon
        
        switch (currentQuestion.type) {
            case 'text':
                return (
                    <div className="relative">
                        <IconComponent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder={currentQuestion.placeholder}
                            value={answers[currentQuestion.id] || currentQuestion.defaultValue || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                )
                
            case 'number':
                return (
                    <div className="relative">
                        <IconComponent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="number"
                            placeholder={currentQuestion.placeholder}
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerChange(parseInt(e.target.value) || '')}
                            min={currentQuestion.validation?.min}
                            max={currentQuestion.validation?.max}
                            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                )
                
            case 'radio':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <label
                                key={option}
                                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:border-purple-300 hover:bg-purple-50/50 ${
                                    answers[currentQuestion.id] === option
                                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                                        : 'border-slate-200 bg-white/80'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={currentQuestion.id}
                                    value={option}
                                    checked={answers[currentQuestion.id] === option}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    className="w-5 h-5 text-purple-600 border-slate-300 focus:ring-purple-500"
                                />
                                <span className="ml-3 text-lg text-slate-700">{option}</span>
                            </label>
                        ))}
                    </div>
                )
                
            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isChecked = (answers[currentQuestion.id] || []).includes(option)
                            return (
                                <label
                                    key={option}
                                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:border-purple-300 hover:bg-purple-50/50 ${
                                        isChecked
                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                            : 'border-slate-200 bg-white/80'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange(option)}
                                        className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="ml-3 text-lg text-slate-700">{option}</span>
                                </label>
                            )
                        })}
                    </div>
                )
                
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">
                            Question {currentStep + 1} of {totalSteps}
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            {React.createElement(currentQuestion.icon, {
                                className: "w-8 h-8 text-white"
                            })}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {currentQuestion.title}
                        </h2>
                        {currentQuestion.required && (
                            <p className="text-sm text-slate-500">This question is required</p>
                        )}
                    </div>

                    <div className="space-y-6">
                        {renderQuestionInput()}
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    {currentStep === totalSteps - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!isCurrentStepValid() || isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Complete Survey
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!isCurrentStepValid()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SkinSurvey
