import React from "react";
import "../App.css";

export default function MyNFTs({ yourNFTsBalance }) {
  if (!yourNFTsBalance) {
    yourNFTsBalance = 0;
  }
  return (
    <div>
      <h1>You have {yourNFTsBalance} NFTs</h1>
    </div>
  );
}
