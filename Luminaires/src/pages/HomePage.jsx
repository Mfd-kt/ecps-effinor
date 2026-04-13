import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import CEEExplanation from '@/components/CEEExplanation';
import CaseStudies from '@/components/CaseStudies';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';

function HomePage() {
  return (
    <>
      <Helmet>
        <title>EFFINOR - Solutions d'Éclairage LED Professionnel | Groupe Effinor</title>
        <meta name="description" content="Réduisez vos coûts énergétiques jusqu'à 70% avec nos solutions d'éclairage LED professionnel. Bénéficiez des primes CEE et d'un accompagnement complet par EFFINOR, Groupe Effinor." />
      </Helmet>
      <main className="min-h-screen bg-slate-50">
        <Hero />
        <SocialProof />
        <Benefits />
        <HowItWorks />
        <CEEExplanation />
        <CaseStudies />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}

export default HomePage;