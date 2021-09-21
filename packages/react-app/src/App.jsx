import { /*StaticJsonRpcProvider,*/ Web3Provider } from "@ethersproject/providers";
import { formatEther /*, parseEther */ } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import WalletConnectProvider from "@walletconnect/web3-provider";
/*import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import "antd/dist/antd.css";*/
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
/*import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";*/
import Web3Modal from "web3modal";
import "./App.css";
import {
  /*Account,
  Address,
  AddressInput,
  Contract,
  Faucet,
  GasGauge,*/
  Header,
  MyNFTs,
  /*Ramp,
  ThemeSwitch,
  Sell,
  Mint,
  LazyMint,
  RaribleItemIndexer,*/
} from "./components";
import { /*DAI_ABI, DAI_ADDRESS,*/ INFURA_ID /*NETWORK, NETWORKS*/ } from "./constants";
//import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  /*useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,*/
} from "./hooks";
//import { matchSellOrder, prepareMatchingOrder } from "./rarible/createOrders";

console.log("STARTING PAGE 0....");

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

function App(props) {
  console.log("STARTING PAGE 1....");

  const [injectedProvider, setInjectedProvider] = useState();
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const metamaskAddress = useUserAddress(injectedProvider);
  const metamaskAddressBalanceWei = useBalance(injectedProvider, metamaskAddress);

  const metamaskNetworkName = injectedProvider && injectedProvider._network && injectedProvider._network.name;
  /* hook panaudojimas setState
  const [metamaskAddress, setMetamaskAddress] = useState();
  useEffect(() => {
    setMetamaskAddress(metamaskAddress);
  }, [metamaskAddress]);
  const [metamaskAddressBalanceWei, setMetamaskAddressBalanceWei] = useState();
  useEffect(() => {
    setMetamaskAddressBalanceWei(metamaskAddressBalanceWei);
  }, [metamaskAddressBalanceWei]);*/

  return (
    <div className="App">
      <Header />
      <MyNFTs />
      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div> Metamask network name: {metamaskNetworkName}</div>
        <div> Metamask address: {metamaskAddress}</div>
        <div> Metamask address balance: {formatEther(metamaskAddressBalanceWei || BigNumber.from("0"))} eth</div>
      </div>
    </div>
  );
}

export default App;
