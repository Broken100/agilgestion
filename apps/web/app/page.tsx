import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Benefits } from '@/components/landing/benefits';
import { CtaBanner } from '@/components/landing/cta-banner';
import { Contact } from '@/components/landing/contact';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white-canvas">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
