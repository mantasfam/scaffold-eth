import React from "react";
import "../App.css";

export default function NFTsMarkeplace({ totalNFTsBalance }) {
  if (!totalNFTsBalance) {
    totalNFTsBalance = 0;
  }
  return (
    <div>
      <h1>There are {totalNFTsBalance} NFTs in marketplace</h1>
    </div>
  );
}
