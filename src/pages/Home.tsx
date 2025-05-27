import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen h-full text-center flex'>
      <p className='m-auto'>{"<Do Something here>"}</p>
    </div>
  )
};

export default Home;