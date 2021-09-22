import { PageHeader } from "antd";
import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther /*, parseEther */ } from "@ethersproject/units";

// displays a page header
export default function Header({ metamaskNetworkName, metamaskAddress, metamaskAddressBalanceWei }) {
  return (
    <div style={{ backgroundColor: "powderblue" }}>
      <PageHeader title="🏗 NFT" subTitle="marketplace" style={{ cursor: "pointer" }} />
      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div> Metamask network name: {metamaskNetworkName}</div>
        <div> Metamask address: {metamaskAddress}</div>
        <div> Metamask address balance: {formatEther(metamaskAddressBalanceWei || BigNumber.from("0"))} eth</div>
      </div>
    </div>
  );
}
