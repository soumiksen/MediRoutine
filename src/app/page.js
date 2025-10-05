import Button from '@/components/button';

export default function Home() {
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
            <div className='bg-remedy-secondary text-remedy-primary p-8 rounded-2xl shadow-lg border-2 border-remedy-alert'>
              <div className='text-5xl mb-4'>📋</div>
              <h3 className='text-2xl font-bold mb-3'>Too Many Instructions</h3>
              <p className='text-lg'>
                Multiple medications, different times, various foods to
                avoid—it's hard to keep track.
              </p>
            </div>

            <div className='bg-remedy-secondary text-remedy-primary p-8 rounded-2xl shadow-lg border-2 border-remedy-alert'>
              <div className='text-5xl mb-4'>❓</div>
              <h3 className='text-2xl font-bold mb-3'>
                Confusing Medical Terms
              </h3>
              <p className='text-lg'>
                What does "twice daily" mean? Before or after meals? It
                shouldn't be this complicated.
              </p>
            </div>

            <div className='bg-remedy-secondary text-remedy-primary p-8 rounded-2xl shadow-lg border-2 border-remedy-alert'>
              <div className='text-5xl mb-4'>⏰</div>
              <h3 className='text-2xl font-bold mb-3'>Easy to Forget</h3>
              <p className='text-lg'>
                Life gets busy. Without reminders, it's easy to miss doses or do
                things in the wrong order.
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
              We turn complicated doctor's orders into a clear, simple daily
              plan.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
            <div className='bg-remedy-teal text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
              <div className='text-8xl mb-4'>📝</div>
              <p className='text-2xl font-semibold'>Step 1: Copy & Paste</p>
            </div>
            <div>
              <h3 className='text-3xl font-bold mb-4'>Simply Type or Paste</h3>
              <p className='text-xl leading-relaxed'>
                Just copy your doctor's instructions from your prescription
                bottle, discharge papers, or appointment notes and paste them
                into RemedyRX. That's it. No complicated forms to fill out.
              </p>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
            <div className='order-2 md:order-1'>
              <h3 className='text-3xl font-bold mb-4'>AI Does the Hard Work</h3>
              <p className='text-xl leading-relaxed'>
                Our smart technology reads your instructions and figures out
                exactly what you need to do, when you need to do it, and how. No
                medical degree required.
              </p>
            </div>
            <div className='bg-remedy-aqua text-remedy-primary p-12 rounded-3xl shadow-2xl text-center order-1 md:order-2'>
              <div className='text-8xl mb-4'>🤖</div>
              <p className='text-2xl font-semibold'>Step 2: AI Organizes</p>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='bg-remedy-success text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
              <div className='text-8xl mb-4'>✅</div>
              <p className='text-2xl font-semibold'>Step 3: Follow Your Plan</p>
            </div>
            <div>
              <h3 className='text-3xl font-bold mb-4'>
                Get Your Daily Schedule
              </h3>
              <p className='text-xl leading-relaxed'>
                See exactly what to take, eat, and do—hour by hour. Large,
                easy-to-read text. Clear reminders. Everything organized in one
                simple place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Why Families Love RemedyRX
          </h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center p-6'>
              <div className='w-20 h-20 bg-remedy-success rounded-full mx-auto mb-4 flex items-center justify-center text-4xl'>
                👓
              </div>
              <h3 className='text-xl font-bold mb-2'>Large, Clear Text</h3>
              <p>Easy to read, even without glasses</p>
            </div>

            <div className='text-center p-6'>
              <div className='w-20 h-20 bg-remedy-aqua rounded-full mx-auto mb-4 flex items-center justify-center text-4xl'>
                🔔
              </div>
              <h3 className='text-xl font-bold mb-2'>Gentle Reminders</h3>
              <p>Never miss a dose again</p>
            </div>

            <div className='text-center p-6'>
              <div className='w-20 h-20 bg-remedy-teal rounded-full mx-auto mb-4 flex items-center justify-center text-4xl'>
                📱
              </div>
              <h3 className='text-xl font-bold mb-2'>Simple to Use</h3>
              <p>No tech skills needed</p>
            </div>

            <div className='text-center p-6'>
              <div className='w-20 h-20 bg-remedy-success rounded-full mx-auto mb-4 flex items-center justify-center text-4xl'>
                👨‍👩‍👧
              </div>
              <h3 className='text-xl font-bold mb-2'>Family Sharing</h3>
              <p>Your loved ones can help monitor</p>
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
          <Button>Get Started Now - Free Forever!</Button>
          <p className='text-remedy-primary text-lg mt-4'>
            ✓ 100% Free ✓ No signup required ✓ Works instantly
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-remedy-secondary text-remedy-primary py-12'>
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
