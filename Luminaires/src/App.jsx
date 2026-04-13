import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import LegalNoticePage from '@/pages/LegalNoticePage';
import Footer from '@/components/Footer';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mentions-legales" element={<LegalNoticePage />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;