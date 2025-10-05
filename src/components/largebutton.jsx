const Button = ({ children }) => {
  return (
    <button className='bg-remedy-aqua px-8 py-4 rounded-full text-white text-xl font-semibold hover:cursor-pointer hover:bg-opacity-90 transition-all'>
      {children}
    </button>
  );
};

export default Button;