'use client';
import { useAuth } from '@/context/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from './button';

const Navbar = () => {
  const {
    user,
    userData,
    isProvider,
    isPatient,
    loading,
    signOut: authSignOut,
  } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const success = await authSignOut();
    // Redirect regardless of success/failure
    router.replace('/authentication');
  };
  return (
    <header className='bg-remedy-primary shadow-lg text-secondary'>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <Image src='/logo.png' width={50} height={50} alt='RemedyRx' />

            <Link href='/'>
              <span className='text-3xl font-bold text-secondary'>
                RemedyRx
              </span>
            </Link>
          </div>
          {loading ? null : user ? (
            <div className='flex items-center gap-3'>
              <span className='text-sm'>
                {userData?.name || user.email} —{' '}
                {isProvider ? 'Provider' : isPatient ? 'Patient' : 'No role'}
              </span>
              {isProvider && (
                <Link href='/providerdashboard'>
                  <Button>Provider Dashboard</Button>
                </Link>
              )}
              {isPatient && (
                <Link href='/dashboard'>
                  <Button>My Dashboard</Button>
                </Link>
              )}
              <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
          ) : (
            <Link href='/authentication'>
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
