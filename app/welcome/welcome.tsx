import AssetSelector from "~/asset-selector";
import hermesLogo from "./hermes.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ArrowDown from "~/arrow-down";
import { useState } from "react";
import {
  Chain,
  compressStellarAddress,
  getExplorerUrlFromHash,
  useStellarTokenBalance,
  useTimeLockedSwap,
  useTokenBalance,
  type SwapArgs,
} from "~/common";
import {
  isConnected,
  requestAccess,
  signTransaction,
  signMessage,
} from "@stellar/freighter-api";
import { useAccount, useSignMessage } from "wagmi";
import { type SwapResp } from "resolver/nevm";
import { parseEther } from "viem";

const connectFreighter = async () => {
  const isAvailable = await isConnected();
  if (isAvailable) {
    const publicKey = await requestAccess();
    return publicKey;
  }
};
export function Welcome() {
  const [stellarPublicKey, setStellarPublicKey] = useState<string>(null!);
  const [activeChain, setActiveChain] = useState(Chain.Ethereum);
  const isEthActive = activeChain === Chain.Ethereum;
  const [fromChainName, toChainName] = isEthActive
    ? ["ETHEREUM", "STELLAR"]
    : ["STELLAR", "ETHEREUM"];

  const ethAssets = ["DTK"];
  const [currentEthAsset, setEthAsset] = useState(ethAssets[0]);
  const [amount, setAmount] = useState(0);

  const stellarAssets = ["DTK"];
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
  const toggleChain = () =>
    isEthActive
      ? setActiveChain(Chain.Stellar)
      : setActiveChain(Chain.Ethereum);

  const { address, isConnected } = useAccount();

  const { signMessageAsync } = useSignMessage();
  // To sign a message, call: signMessage({ message: 'Hello from RainbowKit!' });
  const {
    data: ethTokenBalance,
    isLoading: ethTokenBalanceLoading,
    isSuccess: ethTokenBalanceSuccess,
  } = useTokenBalance(address);
  const {
    data: stellarTokenBalance,
    isLoading: stellarTokenBalanceLoading,
    isSuccess: stellarTokenBalanceSuccess,
  } = useStellarTokenBalance(stellarPublicKey);
  const { mutateAsync: swap, isPending: swapPending } = useTimeLockedSwap();

  const [swapResp, setSwapResp] = useState<SwapResp | null>(null);

  return (
    <>
      <nav className="border border-gray-200 py-2 px-16 flex items-center justify-between mb-12">
        <div className="flex-shrink-0">
          <img src={hermesLogo} alt="Hermes" className="h-24 w-auto" />
        </div>
        <div className="flex-shrink-0 ml-auto mr-2">
          {stellarPublicKey ? (
            <span className="text-black font-bold bg-white hover:bg-gray-100 active:bg-gray-200 cursor-pointer px-4 py-2 block rounded-lg transform hover:scale-105 shadow-lg">
              {compressStellarAddress(stellarPublicKey)}
            </span>
          ) : (
            <button
              className="text-black font-bold bg-white hover:bg-gray-100 active:bg-gray-200 cursor-pointer px-4 py-2 block rounded-lg transform hover:scale-105 shadow-lg"
              onClick={async (e) => {
                e.preventDefault();
                const response = await connectFreighter();
                const error = response?.error;
                if (error) {
                  console.error(error);
                  alert("Could not connect Freighter Wallet");
                  return;
                }
                setStellarPublicKey(response!.address);
              }}
            >
              Connect Freighter
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          <ConnectButton label="ETH Connect" />
        </div>
      </nav>
      <main className="px-16">
        <div className="border border-gray-200 p-4 mx-auto max-w-128 mb-4">
          ETH DTK Balance:{" "}
          {ethTokenBalanceLoading ? "Loading..." : ethTokenBalance}
        </div>
        <div className="border border-gray-200 p-4 mx-auto max-w-128 mb-4">
          Stellar DTK Balance:{" "}
          {stellarTokenBalanceLoading ? "Loading..." : stellarTokenBalance}
        </div>
        <div className="border border-gray-200 p-4 mx-auto max-w-128 mb-4">
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
                  value={amount}
                  //@ts-ignore
                  onChange={(e) => setAmount(e.target.value as number)}
                  autoFocus
                  type="number"
                />
              </div>
              <div className="text-xs text-gray-500">On {fromChainName}</div>
            </div>
            <button
              onClick={toggleChain}
              className="border rounded-full bg-white active:bg-gray-100 border-gray-300 absolute cursor-pointer h-8 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:rotate-180 transition-transform flex items-center justify-center"
            >
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
                  {amount}
                </div>
              </div>
              <div className="text-xs text-gray-500">On {toChainName}</div>
            </div>
          </div>
          <button
            disabled={swapPending}
            className="text-white font-bold bg-black hover:bg-gray-900 active:bg-gray-800 cursor-pointer px-4 py-2 block w-full"
            onClick={async (e) => {
              e.preventDefault();
              if (swapPending) {
                return;
              }
              if (!address) {
                return alert("ETH Wallet is Not connected");
              }
              if (!stellarPublicKey) {
                return alert("Stellar Wallet is not connected");
              }
              
              const xAmount = parseEther(amount.toString());
              const ethArgs = {
                chain: Chain.Ethereum,
                args: {
                  maker: BigInt(address),
                  makingAmount: xAmount,
                  receiver: stellarPublicKey,
                  receivingAmount: xAmount,
                },
              } as SwapArgs;
              const stellarArgs = {
                chain: Chain.Stellar,
                args: {
                  maker: stellarPublicKey,
                  makingAmount: xAmount,
                  receiver: BigInt(address),
                  receivingAmount: xAmount,
                },
              } as SwapArgs;
              const args =
                activeChain === Chain.Ethereum ? ethArgs : stellarArgs;
                if (activeChain === Chain.Ethereum) {
                  await signMessageAsync({message: `Initiate Swap from ETH to Stellar`});
                } else {
                  await signMessage(`Initiate Swap from Stellar to ETH`)
                }
              const resp = await swap(args);
              setSwapResp(resp);
              console.log({ resp });
            }}
          >
            {!swapPending ? "SWAP" : "swap in progress..."}
          </button>
        </div>
        {swapResp && (
          <div className="border border-gray-200 p-4 mx-auto max-w-128 mb-4">
            <div className="border border-gray-200 p-2 mx-auto max-w-128">
              <div className="font-bold">Src Escrow Creation</div>
              <a
                className="text-blue-500 underline"
                href={getExplorerUrlFromHash(swapResp.srcEscrowCreation)}
                target="_blank"
              >
                {compressStellarAddress(swapResp.srcEscrowCreation, 20, 20)}
              </a>
            </div>
            <div className="border border-gray-200 p-2 mx-auto max-w-128">
              <div className="font-bold">Dst Escrow Creation</div>
              <a
                className="text-blue-500 underline"
                href={getExplorerUrlFromHash(swapResp.dstEscrowCreation)}
                target="_blank"
              >
                {compressStellarAddress(swapResp.dstEscrowCreation, 20, 20)}
              </a>
            </div>
            <div className="border border-gray-200 p-2 mx-auto max-w-128">
              <div className="font-bold">Dst Escrow Withdrawal</div>
              <a
                className="text-blue-500 underline"
                href={getExplorerUrlFromHash(swapResp.dstEscrowWithdrawal)}
                target="_blank"
              >
                {compressStellarAddress(swapResp.dstEscrowWithdrawal, 20, 20)}
              </a>
            </div>
            <div className="border border-gray-200 p-2 mx-auto max-w-128">
              <div className="font-bold">Src Escrow Withdrawal</div>
              <a
                className="text-blue-500 underline"
                href={getExplorerUrlFromHash(swapResp.srcEscrowWithdrawal)}
                target="_blank"
              >
                {compressStellarAddress(swapResp.srcEscrowWithdrawal, 20, 20)}
              </a>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
