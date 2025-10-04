const Button = ({ children }) => {
  return (
    <button className='bg-remedy-aqua px-4 py-2 rounded-full text-white hover:cursor-pointer'>
      {children}
    </button>
  );
};

export default Button;
