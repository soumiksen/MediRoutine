const Button = ({ children }) => {
  return (
    <button className='bg-remedy-aqua px-6 py-6 rounded-full text-white text-xl font-semibold hover:cursor-pointer hover:bg-opacity-90 transition-all'>
      {children}
    </button>
  );
};

export default Button;