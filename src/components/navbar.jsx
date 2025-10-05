import Image from 'next/image';
import Button from './button';

const Navbar = () => {
  return (
    <header className='bg-remedy-primary shadow-lg text-secondary'>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <Image src='/logo.png' width={50} height={50} alt='RemedyRx' />

            <span className='text-3xl font-bold text-secondary'>RemedyRx</span>
          </div>
          <Button>Sign In</Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
