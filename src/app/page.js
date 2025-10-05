'use client';

import Button from '@/components/largebutton';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isProvider, isPatient, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (isProvider) {
        router.replace('/providerdashboard');
      } else if (isPatient) {
        router.replace('/dashboard');
      }
      // If user exists but no role, stay on landing page
    }
  }, [loading, user, isProvider, isPatient, router]);

  // Show loading or redirect in progress
  if (loading) {
    return (
      <div className='bg-remedy-primary text-remedy-secondary min-h-screen flex items-center justify-center'>
        <div className='text-2xl'>Loading...</div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  return (
    <div className='bg-remedy-primary text-remedy-secondary'>
      {/* Hero Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center'>
          <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>
            Never Miss a Dose.
            <br />
            <span>Never Feel Confused.</span>
          </h1>
          <p className='text-2xl mb-12 max-w-3xl mx-auto'>
            Your doctor's instructions, transformed into a simple daily schedule
            you can actually follow.
          </p>
          <Button>Try RemedyRX Now!</Button>
          <p className='mt-4 text-lg'></p>
        </div>
      </section>

      {/* Problem Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>
              We Know It's Overwhelming
            </h2>
            <p className='text-xl max-w-2xl mx-auto'>
              Doctor's instructions can be confusing. Pills, timing, meals,
              exercises—it's a lot to remember.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-remedy-gray text-remedy-primary dark:text-remedy-secondary p-8 rounded-2xl shadow-lg'>
              <div className='text-5xl mb-4'>📋</div>
              <h3 className='text-2xl font-bold mb-3'>Too Many Instructions</h3>
              <p className='text-lg'>
                Multiple medications, different times, various foods to
                avoid—it's hard to keep track.
              </p>
            </div>

            <div className='bg-remedy-gray  text-remedy-primary dark:text-remedy-secondary   p-8 rounded-2xl shadow-lg '>
              <div className='text-5xl mb-4'>❓</div>
              <h3 className='text-2xl font-bold mb-3'>
                Confusing Medical Terms
              </h3>
              <p className='text-lg'>
                What does "twice daily" mean? Before or after meals? It
                shouldn't be this complicated.
              </p>
            </div>

            <div className='bg-remedy-gray  text-remedy-primary dark:text-remedy-secondary   p-8 rounded-2xl shadow-lg'>
              <div className='text-5xl mb-4'>⏰</div>
              <h3 className='text-2xl font-bold mb-3'>Easy to Forget</h3>
              <p className='text-lg'>
                `` Life gets busy. Without reminders, it's easy to miss doses or
                do things in the wrong order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>
              Here's How RemedyRX Helps
            </h2>
            <p className='text-xl max-w-2xl mx-auto'>
              Two simple ways to get your medications organized—choose what
              works best for you.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-12'>
            {/* Option 1: Doctor Voice Input */}
            <div className='bg-remedy-gray  text-remedy-primary dark:text-remedy-secondary  p-8 rounded-2xl shadow-lg'>
              <h3 className='text-2xl font-bold text-center mb-8'>
                Option 1: Doctor Voice Input
              </h3>

              <div className='space-y-8'>
                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-teal rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    🎤
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 1: Doctor Speaks
                  </h4>
                  <p className='text-base'>
                    Your doctor records medicine names, dosages, timing, and
                    instructions directly into the app.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-aqua rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    🤖
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 2: AI Organizes
                  </h4>
                  <p className='text-base'>
                    Our technology listens and creates your personalized daily
                    schedule automatically.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-success rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    ✅
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 3: Follow Your Plan
                  </h4>
                  <p className='text-base'>
                    See exactly what to take and when, with reminders and
                    easy-to-read schedules.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: OCR Photo */}
            <div className='bg-remedy-gray  text-remedy-primary dark:text-remedy-secondary  p-8 rounded-2xl shadow-lg'>
              <h3 className='text-2xl font-bold text-center mb-8'>
                Option 2: Photo Scan (OCR)
              </h3>

              <div className='space-y-8'>
                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-teal rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    📸
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 1: Take a Photo
                  </h4>
                  <p className='text-base'>
                    Snap a picture of your prescription bottle or medicine
                    packaging label.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-aqua rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    🔍
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 2: AI Reads It
                  </h4>
                  <p className='text-base'>
                    Our technology scans the label and understands all the
                    medicine information.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-24 h-24 bg-remedy-success rounded-full mx-auto mb-4 flex items-center justify-center text-5xl'>
                    📅
                  </div>
                  <h4 className='text-xl font-bold mb-2'>
                    Step 3: Get Your Schedule
                  </h4>
                  <p className='text-base'>
                    Medicine automatically added to your routine with reminders
                    in plain language.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='bg-remedy-teal py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl md:text-5xl font-bold text-remedy-primary mb-6'>
            Start Simplifying Your Health Today
          </h2>
          <p className='text-2xl text-remedy-primary mb-4'>
            Join thousands who've simplified their medication routine
          </p>
          <Button>Get Started Now!</Button>
          <p className='text-remedy-primary text-lg mt-4'>
            ✓ 100% Free ✓ Easy to Sign Up ✓ Works instantly
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-remedy-gray  text-remedy-primary dark:text-remedy-secondary   py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8 mb-8'>
            <div>
              <h4 className='font-bold text-xl mb-4'>RemedyRX</h4>
              <p className='opacity-80'>
                Simplifying medication management for everyone.
              </p>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Product</h4>
              <ul className='space-y-2 opacity-80'>
                <li>Features</li>
                <li>How It Works</li>
                <li>About Us</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Support</h4>
              <ul className='space-y-2 opacity-80'>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Legal</h4>
              <ul className='space-y-2 opacity-80'>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>HIPAA Compliance</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-remedy-primary/30 pt-8 text-center opacity-80'>
            <p>
              © 2024 RemedyRX. All rights reserved. A free service for better
              health.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
