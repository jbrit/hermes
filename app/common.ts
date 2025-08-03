import { useMutation, useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import {Keypair, Networks} from '@stellar/stellar-sdk';
import {Client as TokenClient} from "stellar-dummy-token";
import { swapEthToStellar, swapStellarToEth, type StellarToEthArgs, type EthToStellarArgs } from 'resolver/nevm';


export enum Chain {
    Ethereum,
    Stellar
}

export function compressStellarAddress(address: string, front = 6, back = 5): string {
  if (!address || address.length < front + back) return address;
  return `${address.slice(0, front)}...${address.slice(-back)}`;
}


const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_SEPOLIA_RPC);

export async function getEthBalance(address: string): Promise<string> {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export async function getTokenBalance(userAddress: string): Promise<string> {
  const token = new ethers.Contract(import.meta.env.VITE_ETH_DUMMY_TOKEN, ERC20_ABI, provider);
  const [balance, decimals] = await Promise.all([
    token.balanceOf(userAddress),
    token.decimals(),
  ]);
  return ethers.formatUnits(balance, decimals);
}
export function useTokenBalance(userAddress: string | undefined) {
  return useQuery({
    queryKey: ['token-balance', userAddress],
    queryFn: () => getTokenBalance(userAddress!),
    enabled: !!userAddress,
    staleTime: 30_000,
  });
}

const stellarKeypair = Keypair.fromSecret(import.meta.env.VITE_STELLAR_PRIVATE_KEY as string);
const stellarTokenClient = new TokenClient({
    contractId: "CCQVMIR5FVBRAGCVXL3W2FVG4AQYP5V3PCOGFZ7MRUSZOFVUMSXZ63LC",
    networkPassphrase: Networks.TESTNET,
    allowHttp: true,
    publicKey: stellarKeypair.publicKey(),
    rpcUrl: 'https://soroban-testnet.stellar.org'
});


export async function getStellarContractTokenBalance(accountId: string) {
    const tokenBalanceTransaction = await stellarTokenClient.balance({account: accountId});
    return ethers.formatEther(tokenBalanceTransaction.result)
}
export function useStellarTokenBalance(accountId: string | null) {
  return useQuery({
    queryKey: ['stellar-token-balance', accountId],
    queryFn: () => getStellarContractTokenBalance(accountId!),
    enabled: !!accountId,
    staleTime: 300_000,
  });
}


export type SwapArgs = 
  | { chain: Chain.Ethereum; args: EthToStellarArgs }
  | { chain: Chain.Stellar; args: StellarToEthArgs };

export function useTimeLockedSwap() {
  return useMutation({
    mutationFn: async (input: SwapArgs) => {
      if (input.chain === Chain.Ethereum) {
        return await swapEthToStellar(input.args);
      }
      return await swapStellarToEth(input.args);
    },
  });
}

export const getExplorerUrlFromHash = (hash: string) => {
    return hash.startsWith('0x') ? `https://sepolia.etherscan.io/tx/${hash}` : `https://stellar.expert/explorer/testnet/tx/${hash}`;
}