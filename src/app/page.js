import Button from '@/components/largebutton';

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
        Two simple ways to get your medications organized—choose what works best for you.
      </p>
    </div>

    {/* Option 1: Doctor Voice Input */}
    <div className='mb-20'>
      <h3 className='text-3xl font-bold text-center mb-12'>
        Option 1: Your Doctor Records Instructions
      </h3>
      
      <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
        <div className='bg-remedy-teal text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
          <div className='text-8xl mb-4'>🎤</div>
          <p className='text-2xl font-semibold'>
            Step 1: Doctor Speaks
          </p>
        </div>
        <div>
          <h4 className='text-2xl font-bold mb-4'>
            Doctor Records Your Instructions
          </h4>
          <p className='text-xl leading-relaxed'>
            Your doctor simply speaks into the app—medicine names, dosages, timing, and special instructions. No typing needed. Just their voice explaining everything clearly.
          </p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
        <div className='order-2 md:order-1'>
          <h4 className='text-2xl font-bold mb-4'>
            AI Organizes Everything
          </h4>
          <p className='text-xl leading-relaxed'>
            Our smart technology listens and understands the instructions, then creates your personalized daily schedule automatically. No confusion, no missed details.
          </p>
        </div>
        <div className='bg-remedy-aqua text-remedy-primary p-12 rounded-3xl shadow-2xl text-center order-1 md:order-2'>
          <div className='text-8xl mb-4'>🤖</div>
          <p className='text-2xl font-semibold'>
            Step 2: AI Creates Your Plan
          </p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-12 items-center'>
        <div className='bg-remedy-success text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
          <div className='text-8xl mb-4'>✅</div>
          <p className='text-2xl font-semibold'>
            Step 3: Follow Your Schedule
          </p>
        </div>
        <div>
          <h4 className='text-2xl font-bold mb-4'>
            Your Daily Plan is Ready
          </h4>
          <p className='text-xl leading-relaxed'>
            See exactly what to take and when—hour by hour. Large, easy-to-read text with reminders. Everything your doctor said, organized perfectly.
          </p>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className='border-t-4 border-remedy-secondary my-20'></div>

    {/* Option 2: OCR Photo */}
    <div>
      <h3 className='text-3xl font-bold text-center mb-12'>
        Option 2: Take a Photo of Your Medicine
      </h3>
      
      <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
        <div className='bg-remedy-teal text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
          <div className='text-8xl mb-4'>📸</div>
          <p className='text-2xl font-semibold'>
            Step 1: Snap a Picture
          </p>
        </div>
        <div>
          <h4 className='text-2xl font-bold mb-4'>
            Photograph Your Medicine Label
          </h4>
          <p className='text-xl leading-relaxed'>
            Just take a clear photo of your prescription bottle or medicine packaging—where it shows the name, dosage, and instructions. That's all you need.
          </p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
        <div className='order-2 md:order-1'>
          <h4 className='text-2xl font-bold mb-4'>
            AI Reads the Label
          </h4>
          <p className='text-xl leading-relaxed'>
            Our technology scans and understands the medicine information—name, strength, when to take it, and any special instructions. It reads the label so you don't have to squint.
          </p>
        </div>
        <div className='bg-remedy-aqua text-remedy-primary p-12 rounded-3xl shadow-2xl text-center order-1 md:order-2'>
          <div className='text-8xl mb-4'>🔍</div>
          <p className='text-2xl font-semibold'>
            Step 2: AI Scans & Understands
          </p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-12 items-center'>
        <div className='bg-remedy-success text-remedy-primary p-12 rounded-3xl shadow-2xl text-center'>
          <div className='text-8xl mb-4'>📅</div>
          <p className='text-2xl font-semibold'>
            Step 3: Get Your Schedule
          </p>
        </div>
        <div>
          <h4 className='text-2xl font-bold mb-4'>
            Your Medicine Added to Your Routine
          </h4>
          <p className='text-xl leading-relaxed'>
            The medicine is automatically added to your daily schedule with reminders. See when to take it, with food or without, and any important warnings—all in plain language.
          </p>
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
