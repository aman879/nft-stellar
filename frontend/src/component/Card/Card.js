import React from "react";
// import "./Card.css";
import "../../App.css";

const Card = ({ name, image,owner, description }) => {
  return (
    <div className="card-container">
      <div className="card-div">
        <div className='card-inner p-2'>
          <img className='object-cover w-[230px] h-[230px] rounded overflow-hidden' alt="NFT" src={image} />
        <div className='flex flex-col justify-center items-center'>
          <div className="card-content">
            <p className="text-white text-3xl mt-3">{name}</p>
            <p className='text-white mx-2 mt-2'>{description}</p>
            <p className='text-white mx-2 mt-2'>By <span className="text-sm text-gray-400">{owner.slice(0, 5)}...{owner.slice(-4)}</span></p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Card;