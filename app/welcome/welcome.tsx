import AssetSelector from "~/asset-selector";
import hermesLogo from "./hermes.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ArrowDown from "~/arrow-down";
import { useState } from "react";
import { Chain } from "~/common";

export function Welcome() {
  const [activeChain, setActiveChain] = useState(Chain.Ethereum);
  const isEthActive = activeChain === Chain.Ethereum;
  const [fromChainName, toChainName] = isEthActive ? ["ETHEREUM", "STELLAR"] : ["STELLAR", "ETHEREUM"];

  const ethAssets = ["ETH", "USDT"];
  const [currentEthAsset, setEthAsset] = useState(ethAssets[0]);

  const stellarAssets = ["XLM"];
  const [currentStellarAsset, setStellarAsset] = useState(stellarAssets[0]);

  const [fromAssets, toAssets] = isEthActive
    ? [ethAssets, stellarAssets]
    : [stellarAssets, ethAssets];
  const [currentFromAsset, currentToAsset] = isEthActive
    ? [currentEthAsset, currentStellarAsset]
    : [currentStellarAsset, currentEthAsset];
  const [setFromAsset, setToAsset] = isEthActive
    ? [setEthAsset, setStellarAsset]
    : [setStellarAsset, setEthAsset];
  const toggleChain = () => isEthActive ? setActiveChain(Chain.Stellar) : setActiveChain(Chain.Ethereum);

  return (
    <>
      <nav className="border border-gray-200 py-2 px-16 flex items-center justify-between mb-12">
        <div className="flex-shrink-0">
          <img src={hermesLogo} alt="Hermes" className="h-24 w-auto" />
        </div>
        <div className="flex-shrink-0 ml-auto mr-2">
          {/* <ConnectButton label="ETH Connect" /> */}
        </div>
        <div className="flex-shrink-0">
          <ConnectButton label="ETH Connect" />
        </div>
      </nav>
      <main className="px-16">
        <div className="border border-gray-200 p-4 mx-auto max-w-128">
          <div className="block relative">
            <div className="border border-gray-200 bg-[#f3f5fa] p-4 mx-auto max-w-128 mb-4">
              <div className="text-xs text-gray-500">You Pay</div>
              <div className="flex justify-between">
                <AssetSelector
                  assets={fromAssets}
                  selectedAsset={currentFromAsset}
                  onAssetChange={setFromAsset}
                />
                <input
                  className="text-right outline-0 text-2xl"
                  autoFocus
                  type="number"
                />
              </div>
              <div className="text-xs text-gray-500">On {fromChainName}</div>
            </div>
            <button onClick={toggleChain} className="border rounded-full bg-white active:bg-gray-100 border-gray-300 absolute cursor-pointer h-8 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:rotate-180 transition-transform flex items-center justify-center">
              <ArrowDown />
            </button>
            <div className="border border-gray-200 p-4 mx-auto max-w-128 mb-4">
              <div className="text-xs text-gray-500">You Receive</div>
              <div className="flex justify-between">
                <AssetSelector
                  assets={toAssets}
                  selectedAsset={currentToAsset}
                  onAssetChange={setToAsset}
                />
                <div className="text-right outline-0 text-2xl" autoFocus>
                  {2500}
                </div>
              </div>
              <div className="text-xs text-gray-500">On {toChainName}</div>
            </div>
          </div>
          <button
            className="text-white bg-black hover:bg-gray-900 active:bg-gray-800 cursor-pointer px-4 py-2 block w-full"
            onSubmit={(e) => {
              e.preventDefault();
              alert("swap clicked");
            }}
          >
            SWAP
          </button>
        </div>
      </main>
    </>
  );
}