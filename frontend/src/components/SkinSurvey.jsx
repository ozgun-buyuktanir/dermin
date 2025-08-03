import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, User, Calendar, Users, Droplet, AlertCircle, Sun, Zap, Utensils, Coffee, Cigarette, Heart, Stethoscope, Brain, Wind, Leaf } from 'lucide-react';
import logo from '../../dermin_logo.png';
import dataService from '../services/dataService';

const questionIcons = {
    name: User,
    age: Calendar,
    gender: Users,
    skin_type: Droplet,
    facial_conditions: AlertCircle,
    sun_sensitivity: Sun,
    physical_sensitivity: Zap,
    itching: AlertCircle,
    allergies: Heart,
    hair_type: Droplet,
    hair_issues: AlertCircle,
    diet_type: Utensils,
    water_intake: Coffee,
    exercise_frequency: Heart,
    alcohol_consumption: Coffee,
    smoking_habits: Cigarette,
    chronic_illness: Stethoscope,
    stress_level: Brain,
    environment: Wind,
    skincare_routine: Leaf,
};

const SkinSurvey = ({ onComplete, userName }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({ name: userName || '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Check if survey is already completed
    useEffect(() => {
        const checkSurveyStatus = async () => {
            try {
                const status = await dataService.getSurveyStatus();
                if (status.survey_completed) {
                    // Survey already completed, redirect to dashboard
                    onComplete(null, true); // true indicates already completed
                    return;
                }
                
                // Try to get existing survey data
                const existingSurvey = await dataService.getMySurvey();
                if (existingSurvey && existingSurvey.survey_data) {
                    setAnswers(existingSurvey.survey_data);
                }
            } catch (error) {
                console.error('Error checking survey status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSurveyStatus();
    }, [onComplete]);

    const questions = [
        // General Information
        {
            id: 'name',
            title: `Let's get to know you better. What's your full name?`,
            type: 'text',
            placeholder: 'First Name Last Name',
            required: true,
        },
        {
            id: 'age',
            title: 'How old are you?',
            type: 'number',
            placeholder: 'Your age',
            required: true,
            validation: { min: 1, max: 120 }
        },
        {
            id: 'gender',
            title: 'What is your gender?',
            type: 'radio',
            required: true,
            options: ['Female', 'Male', 'Non-binary', 'Prefer not to say']
        },
        // Skin Details
        {
            id: 'skin_type',
            title: 'How would you describe your skin type?',
            type: 'radio',
            required: true,
            options: ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive']
        },
        {
            id: 'facial_conditions',
            title: 'Do you experience any of these on your face?',
            subtitle: 'Select all that apply.',
            type: 'checkbox',
            options: ['Acne', 'Blackheads', 'Whiteheads', 'Redness', 'Flaking/Peeling', 'Eczema', 'Rosacea', 'Dark Spots', 'None of the above']
        },
        {
            id: 'sun_sensitivity',
            title: 'How does your skin react to the sun?',
            type: 'radio',
            required: true,
            options: ['Burns easily', 'Tans easily', 'Burns then tans', 'Not sure']
        },
        {
            id: 'physical_sensitivity',
            title: 'Is your skin sensitive to touch or pressure?',
            type: 'radio',
            required: true,
            options: ['Very sensitive', 'Mildly sensitive', 'Not sensitive']
        },
        // Lifestyle & Health
        {
            id: 'stress_level',
            title: 'What is your typical stress level?',
            type: 'radio',
            required: true,
            options: ['Low', 'Moderate', 'High', 'Very High']
        },
        {
            id: 'water_intake',
            title: 'How much water do you drink daily on average?',
            type: 'radio',
            required: true,
            options: ['Less than 1 liter', '1–2 liters', '2–3 liters', 'More than 3 liters']
        },
        {
            id: 'diet_type',
            title: 'Which best describes your diet?',
            type: 'radio',
            required: true,
            options: ['Balanced', 'High in processed foods', 'Vegetarian', 'Vegan', 'Low-carb', 'Other']
        },
        {
            id: 'exercise_frequency',
            title: 'How often do you exercise per week?',
            type: 'radio',
            required: true,
            options: ['Rarely or never', '1-2 times a week', '3-4 times a week', '5+ times a week']
        },
        {
            id: 'skincare_routine',
            title: 'How would you describe your current skincare routine?',
            type: 'radio',
            required: true,
            options: ['None', 'Basic (cleanse/moisturize)', 'Intermediate (serums, etc.)', 'Advanced (multiple steps)']
        },
        {
            id: 'allergies',
            title: 'Do you have any known allergies (skin or otherwise)?',
            type: 'radio',
            required: true,
            options: ['Yes', 'No', 'Not sure']
        },
    ];

    const totalSteps = questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleAnswer = (id, value) => {
        setError('');
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleNext = () => {
        const currentQuestion = questions[currentStep];
        if (currentQuestion.required && !answers[currentQuestion.id]) {
            setError('This field is required.');
            return;
        }
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentQuestion = questions[currentStep];
        if (currentQuestion.required && !answers[currentQuestion.id]) {
            setError('This field is required.');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            // Prepare survey data
            const surveyData = {
                name: answers.name?.trim() || '',
                age: parseInt(answers.age),
                gender: answers.gender,
                skin_type: answers.skin_type,
                facial_conditions: answers.facial_conditions || [],
                sun_sensitivity: answers.sun_sensitivity,
                physical_sensitivity: answers.physical_sensitivity,
                stress_level: answers.stress_level,
                water_intake: answers.water_intake,
                diet_type: answers.diet_type,
                exercise_frequency: answers.exercise_frequency,
                skincare_routine: answers.skincare_routine,
                allergies: answers.allergies
            };

            // Validate name field
            if (!surveyData.name) {
                setError('Please enter your full name.');
                return;
            }

            // Submit to backend
            const result = await dataService.submitSurvey(surveyData);
            
            console.log('Survey submitted successfully:', result);
            
            // Remove local storage items since data is now in database
            localStorage.removeItem('dermin_survey_completed');
            localStorage.removeItem(`dermin_user_profile_${answers.email}`);

            onComplete(surveyData);
        } catch (error) {
            console.error('Failed to submit survey:', error);
            setError(error.message || 'Failed to submit survey. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInput = (question) => {
        const Icon = questionIcons[question.id] || AlertCircle;

        switch (question.type) {
            case 'text':
            case 'number':
                return (
                    <div className="relative w-full max-w-md">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#90BE6D]/70" size={22} />
                        <input
                            type={question.type}
                            placeholder={question.placeholder}
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#132D46]/50 border-2 border-[#778DA9]/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#90BE6D] focus:border-[#90BE6D] transition-all duration-300"
                            min={question.validation?.min}
                            max={question.validation?.max}
                        />
                    </div>
                );
            case 'radio':
                return (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                        {question.options.map(option => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(question.id, option)}
                                className={`text-center px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 ${answers[question.id] === option ? 'bg-[#90BE6D] border-[#90BE6D] text-white shadow-md' : 'bg-[#132D46]/50 border-[#778DA9]/50 text-gray-200 hover:bg-[#778DA9]/30 hover:border-[#778DA9]'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );
            case 'checkbox':
                 return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                        {question.options.map(option => {
                            const isSelected = answers[question.id]?.includes(option);
                            return (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const currentSelection = answers[question.id] || [];
                                        const newSelection = isSelected
                                            ? currentSelection.filter(item => item !== option)
                                            : [...currentSelection, option];
                                        handleAnswer(question.id, newSelection);
                                    }}
                                    className={`text-center px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 ${isSelected ? 'bg-[#90BE6D] border-[#90BE6D] text-white shadow-md' : 'bg-[#132D46]/50 border-[#778DA9]/50 text-gray-200 hover:bg-[#778DA9]/30 hover:border-[#778DA9]'}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    const currentQuestion = questions[currentStep];
    const Icon = questionIcons[currentQuestion.id] || AlertCircle;

    // Show loading while checking survey status
    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] text-white flex flex-col items-center justify-center p-4">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-8 h-8 bg-[#90BE6D] rounded-full mb-4"
                />
                <p className="text-gray-300">Checking survey status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto"
            >
                <div className="text-center mb-8">
                    <img src={logo} alt="Dermin Logo" className="w-32 h-32 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-100">Personalized Skin Analysis</h1>
                    <p className="text-lg text-[#90BE6D]">Just a few questions to tailor your experience.</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#132D46] rounded-full h-2.5 mb-8 border border-[#778DA9]/50">
                    <motion.div
                        className="bg-gradient-to-r from-[#778DA9] to-[#90BE6D] h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </div>

                <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl shadow-2xl p-6 min-h-[350px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <Icon className="text-[#90BE6D]" size={28} />
                                    <h2 className="text-xl font-semibold text-gray-100">{currentQuestion.title}</h2>
                                </div>
                                {currentQuestion.subtitle && <p className="text-sm text-gray-400">{currentQuestion.subtitle}</p>}
                            </div>
                            <div className="flex justify-center">
                                {renderInput(currentQuestion)}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6">
                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-[#132D46] border-2 border-[#778DA9]/80 rounded-full text-white font-medium hover:bg-[#778DA9]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>

                            {currentStep < totalSteps - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-full text-white font-medium hover:opacity-90 transition-all duration-200 shadow-md"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90BE6D] to-[#A6D49F] rounded-full text-white font-medium hover:opacity-90 transition-all duration-200 shadow-md disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-4 h-4 bg-white rounded-full"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Complete
                                            <Check size={18} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SkinSurvey;
