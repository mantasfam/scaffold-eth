import React from "react";
import "../App.css";

export default function MyNFTs({ yourNFTsBalance }) {
  return (
    <div>
      <h1>You have {yourNFTsBalance} NFTs</h1>
    </div>
  );
}
