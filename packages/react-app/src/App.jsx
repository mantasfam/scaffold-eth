import { /*StaticJsonRpcProvider,*/ Web3Provider } from "@ethersproject/providers";
//import { formatEther, parseEther } from "@ethersproject/units";
//import { BigNumber } from "@ethersproject/bignumber";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { /*Alert, Button,*/ Card, /*Col, Input,*/ List, Menu /*, Row*/ } from "antd";
//import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
/*import ReactJson from "react-json-view";*/
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import {
  //Account,
  Address,
  /*AddressInput,
  Contract,
  Faucet,
  GasGauge,*/
  Header,
  MyNFTs,
  NFTsMarketplace,
  /*Ramp,
  ThemeSwitch,
  Sell,
  Mint,
  LazyMint,
  RaribleItemIndexer,*/
} from "./components";
import { /*DAI_ABI, DAI_ADDRESS,*/ INFURA_ID /*NETWORK*/, NETWORKS } from "./constants";
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
  // connect to injected provider
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

  const metamaskNetworkName = injectedProvider && injectedProvider._network && injectedProvider._network.name;
  const metamaskAddress = useUserAddress(injectedProvider);
  const metamaskAddressBalanceWei = useBalance(injectedProvider, metamaskAddress);

  /* hook panaudojimas setState
  const [metamaskAddress, setMetamaskAddress] = useState();
  useEffect(() => {
    setMetamaskAddress(metamaskAddress);
  }, [metamaskAddress]);
  const [metamaskAddressBalanceWei, setMetamaskAddressBalanceWei] = useState();
  useEffect(() => {
    setMetamaskAddressBalanceWei(metamaskAddressBalanceWei);
  }, [metamaskAddressBalanceWei]);*/

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(injectedProvider);
  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [metamaskAddress]);
  const yourNFTsBalance = balance && balance.toNumber && balance.toNumber();

  const totalNFTs = useContractReader(readContracts, "YourCollectible", "totalSupply");
  const totalNFTsBalance = totalNFTs && totalNFTs.toNumber && totalNFTs.toNumber();

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const [targetNetwork, setTargetNetwork] = useState([]);
  useEffect(() => {
    if (metamaskNetworkName) {
      setTargetNetwork(NETWORKS[metamaskNetworkName]);
    }
  }, [metamaskNetworkName]);

  // IPFS PART ----------------------------------------
  const { BufferList } = require("bl");
  // https://www.npmjs.com/package/ipfs-http-client
  const ipfsAPI = require("ipfs-http-client");

  const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
  // helper function to "Get" from IPFS
  // you usually go content.toString() after this...
  const getFromIPFS = async hashToGet => {
    for await (const file of ipfs.get(hashToGet)) {
      //console.log("File path: " + file.path);
      if (!file.content) continue;
      const content = new BufferList();
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      //console.log(content);
      return content;
    }
  };
  // IPFS PART END----------------------------------------

  // YOUR COLLECTABLES ----------------------------------------
  const [yourCollectibles, setYourCollectibles] = useState();
  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          //console.log("Getting token index", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(metamaskAddress, tokenIndex);
          //console.log("tokenId", tokenId);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          //console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          //console.log("token ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            //console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              owner: metamaskAddress,
              ...jsonManifest,
            });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [metamaskAddress, yourNFTsBalance]);
  // YOUR COLLECTABLES END----------------------------------------

  // NFT marketplace ----------------------------------------
  const [allCollectibles, setAllCollectibles] = useState();
  useEffect(() => {
    const updateAllCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < totalNFTsBalance; tokenIndex++) {
        try {
          //onsole.log("Getting token index", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenByIndex(tokenIndex);
          //console.log("tokenId", tokenId);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          //console.log("tokenURI", tokenURI);
          const owner = await readContracts.YourCollectible.ownerOf(tokenId);
          //console.log("owner", owner);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          //console.log("token ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            //console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              owner: owner,
              ...jsonManifest,
            });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setAllCollectibles(collectibleUpdate);
    };
    updateAllCollectibles();
  }, [totalNFTsBalance]);
  // NFT marketplace end----------------------------------------

  return (
    <div className="App">
      <Header
        metamaskNetworkName={metamaskNetworkName}
        metamaskAddress={metamaskAddress}
        metamaskAddressBalanceWei={metamaskAddressBalanceWei}
      />

      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Your Collectibles
            </Link>
          </Menu.Item>
          <Menu.Item key="/marketplace">
            <Link
              onClick={() => {
                setRoute("/marketplace");
              }}
              to="/marketplace"
            >
              NFT marketplace
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <MyNFTs yourNFTsBalance={yourNFTsBalance} />
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
                        <div>{item.location}</div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>
          <Route path="/marketplace">
            <NFTsMarketplace totalNFTsBalance={totalNFTsBalance} />
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={allCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
                        <div>
                          Owner:{" "}
                          <Address address={item.owner} blockExplorer={targetNetwork.blockExplorer} fontSize={16} />
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>{" "}
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
