import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Search, Calendar, Filter, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import authService from '../services/authService';
import dataService from '../services/dataService';

const AnalysesPage = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const response = await dataService.getUserAnalyses();
        
       
        const mockAnalyses = [
          {
            id: '1',
            title: 'Sivilce Analizi - 1 Ağustos',
            date: '2024-01-15',
            thumbnail: '/ornekler/sivilce-akne.jpg',
            condition: 'Akne',
            severity: 'medium',
            confidence: 0.32,
            status: 'completed'
          },
          {
            id: '2', 
            title: 'İltihaplı Cilt Analizi - 2 Ağustos',
            date: '2024-01-12',
            thumbnail: '/ornekler/iltihaplı-sivilce.webp',
            condition: 'Sivilce',
            severity: 'high',
            confidence: 0.33,
            status: 'completed'
          },
          {
            id: '3',
            title: 'Kuru Cilt Analizi - 3 Ağustos',
            date: '2024-01-10',
            thumbnail: '/ornekler/kurdesen.png',
            condition: 'Kuru Cilt',
            severity: 'low',
            confidence: 0.3,
            status: 'completed'
          }
        ];

        setAnalyses(mockAnalyses);
      } catch (error) {
        console.error('Failed to fetch analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [navigate]);

  // Filter and sort analyses
  const filteredAnalyses = analyses
    .filter(analysis => {
      const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           analysis.condition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || analysis.severity === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
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

  const stats = {
    total: analyses.length,
    high: analyses.filter(a => a.severity === 'high').length,
    medium: analyses.filter(a => a.severity === 'medium').length,
    low: analyses.filter(a => a.severity === 'low').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] to-[#132D46] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#90BE6D] mx-auto mb-4"></div>
          <p className="text-gray-300">Analizler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] to-[#132D46]">
      {/* Header */}
      <div className="bg-[#132D46]/30 backdrop-blur-sm border-b border-[#778DA9]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-[#778DA9]/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Analiz Geçmişi</h1>
                <p className="text-sm text-gray-400">Tüm cilt analizlerinizi görüntüleyin</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] hover:shadow-lg text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Yeni Analiz
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[#90BE6D]/20">
                <TrendingUp className="h-6 w-6 text-[#90BE6D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Toplam Analiz</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Yüksek Önem</p>
                <p className="text-2xl font-bold text-white">{stats.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Orta Önem</p>
                <p className="text-2xl font-bold text-white">{stats.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[#90BE6D]/20">
                <AlertCircle className="h-6 w-6 text-[#90BE6D]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Düşük Önem</p>
                <p className="text-2xl font-bold text-white">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Analiz ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1B2A]/50 border border-[#778DA9]/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#90BE6D] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-[#0D1B2A]/50 border border-[#778DA9]/20 rounded-lg text-white focus:ring-2 focus:ring-[#90BE6D] focus:border-transparent"
              >
                <option value="date">Tarihe göre</option>
                <option value="confidence">Güvenilirliğe göre</option>
                <option value="severity">Önem derecesine göre</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 bg-[#0D1B2A]/50 border border-[#778DA9]/20 rounded-lg text-white focus:ring-2 focus:ring-[#90BE6D] focus:border-transparent"
              >
                <option value="all">Tümü</option>
                <option value="high">Yüksek Önem</option>
                <option value="medium">Orta Önem</option>
                <option value="low">Düşük Önem</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analyses Grid */}
        {filteredAnalyses.length === 0 ? (
          <div className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {analyses.length === 0 ? 'Henüz analiz yok' : 'Bu filtreye uygun analiz bulunamadı'}
            </h3>
            <p className="text-gray-400 mb-6">
              {analyses.length === 0 
                ? 'İlk cilt analizinizi yapmak için yeni bir fotoğraf yükleyin.'
                : 'Farklı filtreler deneyerek aradığınız analizleri bulabilirsiniz.'
              }
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-[#778DA9] to-[#90BE6D] hover:shadow-lg text-white px-6 py-2 rounded-lg transition-all duration-300"
            >
              {analyses.length === 0 ? 'İlk Analizi Başlat' : 'Yeni Analiz'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#132D46]/30 backdrop-blur-sm border border-[#778DA9]/20 rounded-xl overflow-hidden hover:border-[#90BE6D]/40 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/results/${analysis.id}`)}
              >
                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                  <img
                    src={analysis.thumbnail}
                    alt={analysis.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {analysis.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      analysis.severity === 'low' 
                        ? 'bg-[#90BE6D]/20 text-[#90BE6D] border border-[#90BE6D]/30'
                        : analysis.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {analysis.condition}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(analysis.date).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>%{Math.round(analysis.confidence * 100)} güvenilirlik</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      analysis.severity === 'low' ? 'text-[#90BE6D]' :
                      analysis.severity === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {analysis.severity === 'low' ? 'Düşük Önem' :
                       analysis.severity === 'medium' ? 'Orta Önem' : 'Yüksek Önem'}
                    </span>
                    <button className="text-[#778DA9] hover:text-[#90BE6D] text-sm font-medium transition-colors">
                      Detayları Gör
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysesPage;
