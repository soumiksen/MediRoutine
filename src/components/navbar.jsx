import Button from './button';

const Navbar = () => {
  return (
    <header className='bg-remedy-primary shadow-lg text-secondary'>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl'>
              💊
            </div>
            <span className='text-3xl font-bold text-secondary'>RemedyRX</span>
          </div>
          <Button>Sign In</Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
