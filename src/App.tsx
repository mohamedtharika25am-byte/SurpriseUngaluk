import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import SurpriseForm from './components/SurpriseForm';
import SurprisePage from './components/SurprisePage';
import SupabaseInstructionsModal from './components/SupabaseInstructionsModal';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [showSupabaseGuide, setShowSupabaseGuide] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const renderContent = () => {
    if (currentPath.startsWith('/surprise/')) {
      const surpriseId = currentPath.replace('/surprise/', '');
      return (
        <SurprisePage
          id={surpriseId}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    if (currentPath.startsWith('/create')) {
      const searchParams = new URLSearchParams(window.location.search);
      const initialOccasion = (searchParams.get('occasion') as any) || 'birthday';

      return (
        <SurpriseForm
          initialOccasion={initialOccasion}
          onCreated={(id, link) => {
            console.log('Surprise created:', id, link);
          }}
          onNavigateToSurprise={(id) => navigateTo(`/surprise/${id}`)}
        />
      );
    }

    return (
      <HomePage
        onNavigateToCreate={(occasion) => navigateTo(occasion ? `/create?occasion=${occasion}` : '/create')}
        onNavigateToDemo={() => navigateTo('/surprise/demo-birthday-surprise')}
      />
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0A0510] text-[#E0E0E0] font-sans antialiased flex flex-col justify-between selection:bg-pink-500 selection:text-white overflow-x-hidden">
      {/* Immersive Theme Glowing Spotlights */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-pink-900/20 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-950/15 blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10">
        <Navbar
          onNavigate={navigateTo}
          currentRoute={currentPath}
          onOpenSupabaseGuide={() => setShowSupabaseGuide(true)}
        />
        <main>{renderContent()}</main>
      </div>

      <footer className="relative z-10 w-full border-t border-white/10 bg-[#0A0510]/80 backdrop-blur-md py-6 mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-mono tracking-wider">
          <div>
            SurpriseUngalukku © {new Date().getFullYear()} — Personalized Celebrations & Surprises
          </div>
          <button
            onClick={() => setShowSupabaseGuide(true)}
            className="text-pink-400 font-sans font-medium hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Supabase Setup & SQL Schema</span>
          </button>
        </div>
      </footer>

      {/* Supabase Guide Modal */}
      <SupabaseInstructionsModal
        isOpen={showSupabaseGuide}
        onClose={() => setShowSupabaseGuide(false)}
      />
    </div>
  );
}

export default App;
