import React from "react";
import Card from "../Card/Card";

const CardList = ({ userNFTs}) => {

  let cardComponents = [];
  if (userNFTs) {
    cardComponents = userNFTs.map((nft) => {
      return (
        <Card
          key={nft.id}
          name={nft.name}
          owner={nft.owner}
          description={nft.description}
          image={nft.video}
        />
      );
    });
  }

  return (
    <div>
      {userNFTs.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className='flex flex-wrap gap-10 justify-center pb-5'>
          {cardComponents}
        </div>
      )}
    </div>
  );
};

export default CardList;