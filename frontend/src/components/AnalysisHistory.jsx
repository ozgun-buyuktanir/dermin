import { useState } from 'react'
import { Plus, Clock, Camera, TrendingUp, Archive, ChevronDown, Filter, Calendar, AlertCircle } from 'lucide-react'

const AnalysisHistory = ({ analyses, onNewAnalysis, activeAnalysisId, onSelectAnalysis, isOpen = true }) => {
    const [sortBy, setSortBy] = useState('date'); // date, confidence, severity
    const [filterBy, setFilterBy] = useState('all'); // all, high, medium, low
    const [showFilters, setShowFilters] = useState(false);

    // Sort analyses
    const sortedAnalyses = [...analyses].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'confidence':
                return (b.confidence || 0) - (a.confidence || 0);
            case 'severity':
                const severityOrder = { high: 3, medium: 2, low: 1 };
                return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            default:
                return 0;
        }
    });

    // Filter analyses
    const filteredAnalyses = sortedAnalyses.filter(analysis => {
        if (filterBy === 'all') return true;
        return analysis.severity === filterBy;
    });

    return (
        <div className={`bg-white/60 backdrop-blur-sm border-r border-gray-200/50 flex flex-col transition-all duration-300 ${
            isOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}>
            {/* Analysis History */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Analiz Geçmişi
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center justify-center w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all duration-200"
                                title="Filtreler"
                            >
                                <Filter className="w-3 h-3" />
                            </button>
                            <button
                                onClick={onNewAnalysis}
                                className="flex items-center justify-center w-7 h-7 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200"
                                title="Yeni Analiz"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Filters and Sorting */}
                    {showFilters && (
                        <div className="mb-4 p-3 bg-gray-50/80 rounded-xl border border-gray-200/50 space-y-3">
                            {/* Sort Options */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Sıralama</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <option value="date">Tarihe göre</option>
                                    <option value="confidence">Güvenilirliğe göre</option>
                                    <option value="severity">Önem derecesine göre</option>
                                </select>
                            </div>

                            {/* Filter Options */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Filtre</label>
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <option value="all">Tümü</option>
                                    <option value="high">Yüksek Önem</option>
                                    <option value="medium">Orta Önem</option>
                                    <option value="low">Düşük Önem</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="mb-4 text-xs text-gray-500 bg-gray-50/50 rounded-lg px-3 py-2">
                        {filteredAnalyses.length} analiz gösteriliyor {analyses.length !== filteredAnalyses.length && `(${analyses.length} toplam)`}
                    </div>

                    {filteredAnalyses.length === 0 ? (
                        <div className="text-center py-8">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-light mb-1 text-sm">
                                {analyses.length === 0 ? 'Henüz analiz yok' : 'Bu filtreye uygun analiz yok'}
                            </p>
                            <p className="text-xs text-gray-400 font-light">
                                {analyses.length === 0 ? 'İlk fotoğrafınızı yükleyin' : 'Filtreleri değiştirmeyi deneyin'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAnalyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    onClick={() => onSelectAnalysis(analysis.id)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                        analysis.id === activeAnalysisId
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white/80 hover:bg-white border-gray-200/50 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={analysis.thumbnail}
                                            alt="Analysis"
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200/50"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 text-sm truncate">
                                                        {analysis.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {analysis.date}
                                                    </p>
                                                </div>
                                                {analysis.confidence && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        %{Math.round(analysis.confidence * 100)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    analysis.severity === 'low' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : analysis.severity === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {analysis.condition}
                                                </span>
                                                
                                                {analysis.severity && (
                                                    <div className="flex items-center gap-1">
                                                        <AlertCircle className={`w-3 h-3 ${
                                                            analysis.severity === 'low' ? 'text-green-500' :
                                                            analysis.severity === 'medium' ? 'text-yellow-500' :
                                                            'text-red-500'
                                                        }`} />
                                                        <span className="text-xs text-gray-500 capitalize">
                                                            {analysis.severity === 'low' ? 'Düşük' :
                                                             analysis.severity === 'medium' ? 'Orta' : 'Yüksek'}
                                                        </span>
                                                    </div>
                                                )}
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
            <div className="p-4 border-t border-gray-200/50">
                <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">İstatistikler</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-800">{analyses.length}</p>
                            <p className="text-xs text-gray-600">Toplam</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-800">
                                {analyses.filter(a => a.severity === 'high').length}
                            </p>
                            <p className="text-xs text-gray-600">Yüksek</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalysisHistory
