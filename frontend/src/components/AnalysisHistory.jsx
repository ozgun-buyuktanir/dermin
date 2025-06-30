import { useState } from 'react'
import { Plus, Clock, Camera, TrendingUp, Archive } from 'lucide-react'

const AnalysisHistory = ({ analyses, onNewAnalysis, activeAnalysisId, onSelectAnalysis }) => {
    return (
        <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50">
                <button
                    onClick={onNewAnalysis}
                    className="w-full flex items-center gap-2 bg-gray-800 text-white px-3 py-2.5 rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Analysis
                </button>
            </div>

            {/* Analysis History */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Recent Analyses
                    </h3>

                    {analyses.length === 0 ? (
                        <div className="text-center py-8">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-light mb-1 text-sm">No analyses yet</p>
                            <p className="text-xs text-gray-400 font-light">
                                Upload your first photo
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {analyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    onClick={() => onSelectAnalysis(analysis.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        analysis.id === activeAnalysisId
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <img
                                            src={analysis.thumbnail}
                                            alt="Analysis"
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 text-xs truncate">
                                                {analysis.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {analysis.date}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                    analysis.severity === 'low' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : analysis.severity === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {analysis.condition}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="p-3 border-t border-gray-200/50">
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Total</span>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">{analyses.length}</p>
                        <p className="text-xs text-gray-600 font-light">Analyses</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalysisHistory
