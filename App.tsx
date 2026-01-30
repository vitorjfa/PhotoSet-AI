
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Camera as CameraIcon, 
  Target, 
  Image as ImageIcon, 
  Info, 
  RefreshCcw, 
  Printer, 
  Heart, 
  Sun, 
  Moon,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CAMERAS, LENSES, SCENARIOS, GLOSSARY } from './data';
import { Camera, Lens, Scenario, Recommendation, Favorite } from './types';
import { getSmartRecommendation } from './geminiService';

export default function App() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showGlossary, setShowGlossary] = useState(false);

  useEffect(() => {
    const savedFavs = localStorage.getItem('photoSet_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('photoSet_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async () => {
    if (!selectedCamera || !selectedLens || !selectedScenario) return;
    
    setIsLoading(true);
    const result = await getSmartRecommendation(selectedCamera, selectedLens, selectedScenario);
    setRecommendation(result);
    setIsLoading(false);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetAll = () => {
    setSelectedCamera(null);
    setSelectedLens(null);
    setSelectedScenario(null);
    setRecommendation(null);
  };

  const toggleFavorite = () => {
    if (!recommendation || !selectedCamera || !selectedLens || !selectedScenario) return;
    
    const favId = `${selectedCamera.id}-${selectedLens.id}-${selectedScenario.id}`;
    const exists = favorites.find(f => f.id === favId);
    
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== favId));
    } else {
      const newFav: Favorite = {
        id: favId,
        camera: selectedCamera,
        lens: selectedLens,
        scenario: selectedScenario,
        recommendation,
        date: new Date().toLocaleDateString()
      };
      setFavorites([...favorites, newFav]);
    }
  };

  const printRecommendation = () => {
    window.print();
  };

  // Logic for recommended lenses based on scenario
  const suggestedLenses = useMemo(() => {
    if (!selectedScenario) return [];

    const scenarioId = selectedScenario.id;
    return LENSES.filter(l => {
      // Logic mapping scenario IDs to lens types
      if (['s1', 's2', 's15'].includes(scenarioId)) { // Portraits, Kids
        return l.name.includes('50mm') || l.name.includes('85mm') || l.name.includes('70-200mm');
      }
      if (['s3', 's4', 's6'].includes(scenarioId)) { // Landscapes, Urban, Astros
        return l.name.includes('10-18mm') || l.name.includes('16-35mm') || l.name.includes('14mm') || l.name.includes('24mm');
      }
      if (['s9', 's8', 's12'].includes(scenarioId)) { // Macro, Products, Food
        return l.name.includes('Macro') || l.name.includes('60mm') || l.name.includes('100mm') || l.name.includes('50mm');
      }
      if (['s10', 's11'].includes(scenarioId)) { // Animals, Sports
        return l.name.includes('70-200mm') || l.name.includes('70-300mm') || l.name.includes('55-200mm');
      }
      if (['s5', 's13', 's14'].includes(scenarioId)) { // Night, Golden, Interior
        return l.maxAperture <= 2.8;
      }
      return l.name.includes('18-55mm') || l.name.includes('24-70mm'); // Default versatile
    }).slice(0, 4);
  }, [selectedScenario]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 px-4 py-4 backdrop-blur-md border-b ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} no-print`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <CameraIcon className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PhotoSet <span className="text-orange-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowGlossary(!showGlossary)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Glossário"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Alternar Modo"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <section className="text-center mb-12 no-print">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">A foto perfeita começa <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">aqui.</span></h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Selecione seu equipamento e o cenário que deseja capturar. Nossa IA calculará as melhores configurações para o seu hardware.
          </p>
        </section>

        {/* Setup Form */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 no-print">
          <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <CameraIcon className="w-4 h-4 text-orange-500" /> Sua Câmera
            </label>
            <select 
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              value={selectedCamera?.id || ''}
              onChange={(e) => setSelectedCamera(CAMERAS.find(c => c.id === e.target.value) || null)}
            >
              <option value="">Selecione um modelo...</option>
              {CAMERAS.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
            </select>
          </div>

          <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" /> Sua Lente
            </label>
            <select 
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              value={selectedLens?.id || ''}
              onChange={(e) => setSelectedLens(LENSES.find(l => l.id === e.target.value) || null)}
            >
              <option value="">Selecione uma lente...</option>
              {LENSES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </section>

        {/* Scenario Grid */}
        <section className="mb-8 no-print">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ImageIcon className="text-orange-500" /> Escolha o Cenário
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s)}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all transform hover:scale-105 ${
                  selectedScenario?.id === s.id 
                    ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20' 
                    : isDarkMode ? 'border-gray-800 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:border-orange-200 shadow-sm'
                }`}
              >
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h4 className="font-bold text-sm">{s.name}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{s.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Suggested Lenses Section (NEW) */}
        {selectedScenario && (
          <section className="mb-12 no-print animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider">Lentes recomendadas para {selectedScenario.name}</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {suggestedLenses.length > 0 ? suggestedLenses.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLens(l)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                      selectedLens?.id === l.id
                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                        : isDarkMode 
                          ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                          : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    {l.name}
                    {selectedLens?.id === l.id && <ArrowRight className="w-3 h-3 ml-1" />}
                  </button>
                )) : (
                  <p className="text-xs text-gray-500 italic">As lentes versáteis como a 24-70mm são ótimas opções para este cenário.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Action Button */}
        <section className="flex justify-center gap-4 mb-16 no-print">
          <button
            onClick={resetAll}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <RefreshCcw className="w-4 h-4" /> Resetar
          </button>
          <button
            onClick={handleSearch}
            disabled={!selectedCamera || !selectedLens || !selectedScenario || isLoading}
            className={`px-12 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 ${
              !selectedCamera || !selectedLens || !selectedScenario || isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando...
              </>
            ) : (
              <>
                Gerar Configurações <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </section>

        {/* Recommendation Result */}
        {recommendation && (
          <div id="results-section" className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`rounded-3xl border overflow-hidden transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'}`}>
              
              {/* Result Header */}
              <div className="bg-orange-500 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-orange-100 font-medium text-sm mb-1">Recomendação personalizada para</p>
                  <h3 className="text-3xl font-bold">{selectedScenario?.name}</h3>
                  <p className="mt-2 text-orange-50 text-sm opacity-90 flex items-center gap-2">
                    <CameraIcon className="w-4 h-4" /> {selectedCamera?.model} + <Target className="w-4 h-4 ml-2" /> {selectedLens?.name}
                  </p>
                </div>
                <div className="flex gap-2 no-print">
                  <button 
                    onClick={toggleFavorite}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                    title="Favoritar"
                  >
                    <Heart className={`w-6 h-6 ${favorites.find(f => f.id === `${selectedCamera?.id}-${selectedLens?.id}-${selectedScenario?.id}`) ? 'fill-white text-white' : ''}`} />
                  </button>
                  <button 
                    onClick={printRecommendation}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                    title="Imprimir"
                  >
                    <Printer className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Technical Settings */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <SettingItem icon="🎯" label="Modo" value={recommendation.mode} dark={isDarkMode} />
                  <SettingItem icon="🎞️" label="ISO" value={recommendation.iso} dark={isDarkMode} />
                  <SettingItem icon="👁️" label="Abertura" value={recommendation.aperture} dark={isDarkMode} />
                  <SettingItem icon="⏱️" label="Obturador" value={recommendation.shutter} dark={isDarkMode} />
                  <SettingItem icon="🌡️" label="Balanço Branco" value={recommendation.wb} dark={isDarkMode} />
                  <SettingItem icon="🔍" label="Foco" value={recommendation.focusMode} dark={isDarkMode} />
                  <SettingItem icon="📍" label="Pontos Foco" value={recommendation.focusPoints} dark={isDarkMode} />
                  <SettingItem icon="📏" label="Medição" value={recommendation.metering} dark={isDarkMode} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Tips & Info */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Info className="text-orange-500 w-5 h-5" /> Por que usar estas configurações?
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        "{recommendation.reason}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Lightbulb className="text-yellow-500 w-5 h-5" /> Dicas Práticas
                      </h4>
                      <ul className="space-y-2">
                        {recommendation.tips.map((tip, idx) => (
                          <li key={idx} className="flex gap-3 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Composition & Alerts */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Bookmark className="text-blue-500 w-5 h-5" /> Sugestões de Composição
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {recommendation.composition.map((comp, idx) => (
                          <div key={idx} className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            {comp}
                          </div>
                        ))}
                      </div>
                    </div>

                    {recommendation.alerts.length > 0 && (
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
                        <h4 className="text-red-600 dark:text-red-400 font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" /> Alertas Importantes
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.alerts.map((alert, idx) => (
                            <li key={idx} className="text-sm text-red-700 dark:text-red-300">• {alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <section className="mb-16 no-print">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Heart className="text-red-500" /> Suas Configurações Salvas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav) => (
                <div key={fav.id} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl">{fav.scenario.icon}</span>
                    <button onClick={() => setFavorites(favorites.filter(f => f.id !== fav.id))} className="text-gray-400 hover:text-red-500">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <h4 className="font-bold text-lg">{fav.scenario.name}</h4>
                  <p className="text-xs text-gray-500 mb-4">{fav.camera.model} + {fav.lens.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">ISO {fav.recommendation.iso}</div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">{fav.recommendation.aperture}</div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCamera(fav.camera);
                      setSelectedLens(fav.lens);
                      setSelectedScenario(fav.scenario);
                      setRecommendation(fav.recommendation);
                    }}
                    className="w-full py-2 bg-orange-500/10 text-orange-500 font-bold rounded-lg text-sm hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Glossary Modal/Section */}
        {showGlossary && (
          <section className={`mb-16 p-8 rounded-3xl animate-in zoom-in-95 duration-300 no-print ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">📚 Glossário Técnico</h3>
              <button onClick={() => setShowGlossary(false)} className="text-gray-500 font-bold hover:text-orange-500">&times; Fechar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {GLOSSARY.map((item, idx) => (
                <div key={idx}>
                  <h4 className="font-bold text-orange-500 mb-1">{item.term}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="py-12 px-4 text-center text-gray-500 dark:text-gray-600 text-sm no-print border-t dark:border-gray-800">
        <p>© {new Date().getFullYear()} PhotoSet AI. Criado para ajudar fotógrafos iniciantes a capturar o mundo.</p>
        <p className="mt-2">Inteligência Artificial por Gemini Flash.</p>
      </footer>
    </div>
  );
}

function SettingItem({ icon, label, value, dark }: { icon: string, label: string, value: string, dark: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${dark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold truncate" title={value}>{value}</p>
    </div>
  );
}
