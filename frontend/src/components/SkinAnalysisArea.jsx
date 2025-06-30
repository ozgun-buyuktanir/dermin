import { useState } from 'react'
import { Upload, Camera, Image as ImageIcon, ArrowRight, FileChartColumn, Shield, Clock } from 'lucide-react'

const SkinAnalysisArea = ({ userName }) => {
    const [uploadedImage, setUploadedImage] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const files = e.dataTransfer.files
        if (files[0]) handleFile(files[0])
    }

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setUploadedImage(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    const handleAnalyze = () => {
        setIsAnalyzing(true)
        // API call will be here
        setTimeout(() => setIsAnalyzing(false), 3000)
    }

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-light text-gray-800 mb-3">
                        {userName ? `${userName}, analyze your skin` : 'Analyze your skin'}
                    </h2>
                    <p className="text-gray-600 font-light max-w-lg mx-auto">
                        Upload a photo and get instant AI-powered insights about your skin health
                    </p>
                </div>

                {/* Main Upload Card */}
                <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/30 shadow-xl">
                    {!uploadedImage ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-500 ${
                                dragActive 
                                    ? 'border-gray-400 bg-gray-50/50 scale-105' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/30'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDragActive(true)}
                            onDragLeave={() => setDragActive(false)}
                        >
                            <div className="space-y-4">
                                {/* Single centered icon */}
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-light text-gray-800 mb-2">
                                        Drop your skin photo here
                                    </h3>
                                    <p className="text-gray-600 mb-4 font-light text-sm">
                                        or choose from your device
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-2">
                                    <label className="cursor-pointer block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                                        />
                                        <div className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 rounded-lg hover:bg-gray-900 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
                                            <Upload className="w-4 h-4" />
                                            Select Photo
                                        </div>
                                    </label>
                                    
                                    <div>
                                        <button className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
                                            <Camera className="w-4 h-4" />
                                            Take Photo
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 font-light">
                                        JPG, PNG, WEBP • Max 10MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Image preview */}
                            <div className="relative">
                                <img
                                    src={uploadedImage}
                                    alt="Your skin photo"
                                    className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                                />
                                <button
                                    onClick={() => setUploadedImage(null)}
                                    className="absolute top-2 right-2 text-gray-800 hover:text-gray-900 transition-colors duration-200 text-xl font-bold cursor-pointer hover:cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Analysis button */}
                            <div className="text-center">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-10 py-4 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 font-medium text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Analyzing your skin...
                                        </>
                                    ) : (
                                        <>
                                            <FileChartColumn className="w-5 h-5" />
                                            Analyze My Skin
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Photo tips */}
                <div className="mt-6 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        How to take a good photo
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 font-light">
                        <div>• Use natural daylight</div>
                        <div>• Hold camera steady</div>
                        <div>• Focus on the skin area</div>
                        <div>• Avoid shadows & reflections</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkinAnalysisArea
