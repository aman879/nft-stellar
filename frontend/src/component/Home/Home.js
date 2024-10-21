import React from 'react';

const Home = ({onRouteChange}) => {
  return (
    <div className='text-white flex justify-center items-center h-screen'>
      <div className='text-center'>
        <h1 className='font-semibold text-6xl'>
          Mint your<br />
          <span className='font-thin text-sky-400'>NFTs</span>
        </h1>
        <button
          onClick={() => onRouteChange("mint")}
          type="button"
          className="text-white mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
            Mint
        </button>
      </div>
    </div>
  );
}

export default Home;