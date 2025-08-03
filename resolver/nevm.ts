import { EscrowDst__factory, EscrowFactory__factory, EscrowSrc__factory } from "types/ethers-contracts";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers";
import { decodeTimelocks, encodeTimelocks } from "./timelocks";
import { hexToBytes, type Address } from 'viem';

import {Client as EscrowFactoryClient} from "stellar-escrow-factory";
import {Client as EscrowSrcClient} from "stellar-escrow-src";
import {Client as EscrowDstClient} from "stellar-escrow-dst";
import { Keypair, Networks, Horizon, TransactionBuilder} from '@stellar/stellar-sdk';


function random32Bytes(): Buffer {
  const buf = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    buf[i] = Math.floor(Math.random() * 256); // random byte (0–255)
  }
  return buf;
}

const ETH_FACTORY_ADDRESS = import.meta.env.VITE_ETH_FACTORY_ADDRESS as string;
const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_SEPOLIA_RPC);
const signer = new ethers.Wallet(import.meta.env.VITE_ETH_PRIVATE_KEY as string, provider);
const escrowFactory = EscrowFactory__factory.connect(ETH_FACTORY_ADDRESS, signer);
console.log({ETH_FACTORY_ADDRESS});
const orderHash = keccak256(toUtf8Bytes("random order identifier for now"));
const secret = random32Bytes();
const hashlock = keccak256(secret);
const hashlockBytes = Buffer.from(hexToBytes(hashlock as Address));
const ETH_TAKER = BigInt('0xa20c7f2bf7583e55c68687f06af4a754717d0fb9');
const ETH_DUMMY_TOKEN = BigInt('0x1a68a054e45BC7A4B2651502f76d8D05584f4E43');

const STELLAR_TAKER = "GBNIAEIN4Z2FZND6Q3S6VAWNZCHQPZTY5JECDTA7MFRW3CGQA4B5A4TM";
const STELLAR_DUMMY_TOKEN = "CCQVMIR5FVBRAGCVXL3W2FVG4AQYP5V3PCOGFZ7MRUSZOFVUMSXZ63LC";
const stellarServer = new Horizon.Server(
"https://horizon-testnet.stellar.org",
);
const stellarKeypair = Keypair.fromSecret(import.meta.env.VITE_STELLAR_PRIVATE_KEY as string);
const stellarEscrowFactoryClient = new EscrowFactoryClient({
    contractId: import.meta.env.VITE_STELLAR_FACTORY_ADDRESS as string,
    networkPassphrase: Networks.TESTNET,
    allowHttp: true,
    publicKey: stellarKeypair.publicKey(),
    rpcUrl: 'https://soroban-testnet.stellar.org'
});

function getCurrentUnixTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export type SwapResp = {
    srcEscrowCreation: string;
    dstEscrowCreation: string;
    srcEscrowWithdrawal: string;
    dstEscrowWithdrawal: string;
}

export type EthToStellarArgs =  {
    maker: bigint,
    makingAmount: bigint,
    receiver: string,
    receivingAmount: bigint
}
export const swapEthToStellar = async (args: EthToStellarArgs) => {
    // STEP 1: Create ETH Src Escrow
    const createSrcEscrowTx = await escrowFactory.createSrcEscrow({
        orderHash,
        hashlock,
        maker: args.maker,
        taker: ETH_TAKER,
        token: ETH_DUMMY_TOKEN,
        amount: args.makingAmount,
        safetyDeposit: 0n,
        timelocks: encodeTimelocks({
            src_withdrawal: 0,
            src_public_withdrawal: 300,
            src_cancellation: 600,
            src_public_cancellation: 750,
            dst_withdrawal: 0,
            dst_public_withdrawal: 300,
            dst_cancellation: 450,
            deployed_at: 0
        })
    }, {amount: args.receivingAmount});
    const createSrcEscrowTxReceipt = await createSrcEscrowTx.wait();
    const escrowFactoryInterface = EscrowFactory__factory.createInterface();
    const {ethSrcImmutables, timelocks} = createSrcEscrowTxReceipt!.logs.map((log) => {
        const parsedLog = escrowFactoryInterface.parseLog(log);
        if (parsedLog === null) {
            return null;
        }
        // console.log(`🟢 Event: ${parsedLog.name}`);
        // console.log(parsedLog.args); // typed args here
        const timelocks = decodeTimelocks(parsedLog.args[0][parsedLog.args[0].length-1] as bigint);
        const ethSrcImmutables = {
            orderHash,
            hashlock,
            maker: args.maker,
            taker: ETH_TAKER,
            token: ETH_DUMMY_TOKEN,
            amount: args.makingAmount,
            safetyDeposit: 0n,
            timelocks: encodeTimelocks(timelocks)
        };
        return {ethSrcImmutables, timelocks}
    }).filter(a => a !== null)[0];

    // STEP 2: Create Stellar Dst Escrow
    const dstImmutables = {
        order_hash: Buffer.alloc(32),
        hashlock: hashlockBytes,
        amount: args.receivingAmount,
        safety_deposit: 0n,
        maker: args.receiver,
        taker: STELLAR_TAKER,
        token: STELLAR_DUMMY_TOKEN,
        timelocks: {
            src_withdrawal: 0,
            src_public_withdrawal: 300,
            src_cancellation: 600,
            src_public_cancellation: 750,
            dst_withdrawal: 0,
            dst_public_withdrawal: 300,
            dst_cancellation: 450,
            deployed_at: getCurrentUnixTimestamp()
        }
    };
    const srcCancellationTimestamp = timelocks.deployed_at + timelocks.src_cancellation;

    const createDstAssembledTransaction = await stellarEscrowFactoryClient.create_dst_escrow({immutables: dstImmutables, src_cancellation_timestamp: srcCancellationTimestamp});
    const createDstTransaction = TransactionBuilder.fromXDR(createDstAssembledTransaction.toXDR(), Networks.TESTNET);
    createDstTransaction.sign(stellarKeypair);
    const createDstTransactionResp = await stellarServer.submitTransaction(createDstTransaction);
    
    
    // STEP 3: Withdraw Stellar Dst Escrow
    const escrowDstClient = new EscrowDstClient({
        contractId: createDstAssembledTransaction.result,
        networkPassphrase: Networks.TESTNET,
        allowHttp: true,
        publicKey: stellarKeypair.publicKey(),
        rpcUrl: 'https://soroban-testnet.stellar.org'
    });
    const withdrawDstAssembledTransaction = await escrowDstClient.withdraw({secret, immutables: dstImmutables});
    const withdrawDstTransaction = TransactionBuilder.fromXDR(withdrawDstAssembledTransaction.toXDR(), Networks.TESTNET);
    withdrawDstTransaction.sign(stellarKeypair);
    const withdrawDstTransactionResp = await stellarServer.submitTransaction(withdrawDstTransaction);

    // STEP 4: Withdraw Eth Src Escrow
    const srcEscrowAddress = await escrowFactory.addressOfEscrowSrc(ethSrcImmutables);
    const srcEscrow = EscrowSrc__factory.connect(srcEscrowAddress, signer);
    const srcWithdrawTx = await srcEscrow.withdraw(secret, ethSrcImmutables);
    await srcWithdrawTx.wait();

    return {
        srcEscrowCreation: createSrcEscrowTx.hash,
        dstEscrowCreation: createDstTransactionResp.hash,
        srcEscrowWithdrawal: srcWithdrawTx.hash,
        dstEscrowWithdrawal: withdrawDstTransactionResp.hash,
    } as SwapResp
}
export type StellarToEthArgs =  {
    maker: string,
    makingAmount: bigint,
    receiver: bigint,
    receivingAmount: bigint
}
export const swapStellarToEth = async (args: StellarToEthArgs) => {
    // STEP 1: Create STELLAR Src Escrow
    const srcDeployedAt = getCurrentUnixTimestamp()
    const stellarSrcImmutables = {
        order_hash: Buffer.alloc(32),
        hashlock: hashlockBytes,
        amount: args.makingAmount,
        safety_deposit: 0n,
        maker: args.maker,
        taker: STELLAR_TAKER,
        token: STELLAR_DUMMY_TOKEN,
        timelocks: {
            src_withdrawal: 0,
            src_public_withdrawal: 300,
            src_cancellation: 600,
            src_public_cancellation: 750,
            dst_withdrawal: 0,
            dst_public_withdrawal: 300,
            dst_cancellation: 450,
            deployed_at: srcDeployedAt
        }
    };
    const createSrcAssembledTransaction = await stellarEscrowFactoryClient.create_src_escrow({immutables: stellarSrcImmutables});
    const createSrcTransaction = TransactionBuilder.fromXDR(createSrcAssembledTransaction.toXDR(), Networks.TESTNET);
    createSrcTransaction.sign(stellarKeypair);
    const createSrcTransactionResp = await stellarServer.submitTransaction(createSrcTransaction);
    
    // STEP 2: Create ETH Dst Escrow
    const dstImmutables = {
        orderHash,
        hashlock,
        maker: args.receiver,
        taker: ETH_TAKER,
        token: ETH_DUMMY_TOKEN,
        amount: args.receivingAmount,
        safetyDeposit: 0n,
        timelocks: encodeTimelocks({
            src_withdrawal: 0,
            src_public_withdrawal: 300,
            src_cancellation: 600,
            src_public_cancellation: 750,
            dst_withdrawal: 0,
            dst_public_withdrawal: 300,
            dst_cancellation: 450,
            deployed_at: 0
        })
    };
    const createDstEscrowTx = await escrowFactory.createDstEscrow(dstImmutables, BigInt(srcDeployedAt+600));
    const createDstEscrowTxReceipt = await createDstEscrowTx.wait();
    const dstDeployedAt = (await createDstEscrowTxReceipt!.getBlock()).timestamp;
    dstImmutables.timelocks = encodeTimelocks({
        src_withdrawal: 0,
        src_public_withdrawal: 300,
        src_cancellation: 600,
        src_public_cancellation: 750,
        dst_withdrawal: 0,
        dst_public_withdrawal: 300,
        dst_cancellation: 450,
        deployed_at: dstDeployedAt
    });

    // STEP 3: Withdraw ETH Dst Escrow
    const dstEscrowAddress = await escrowFactory.addressOfEscrowDst(dstImmutables);
    const dstEscrow = EscrowDst__factory.connect(dstEscrowAddress, signer);
    const dstWithdrawTx = await dstEscrow.withdraw(secret, dstImmutables);
    await dstWithdrawTx.wait();
    
    // STEP 4: Withdraw STELLAR Src Escrow
    const escrowSrcClient = new EscrowSrcClient({
        contractId: createSrcAssembledTransaction.result,
        networkPassphrase: Networks.TESTNET,
        allowHttp: true,
        publicKey: stellarKeypair.publicKey(),
        rpcUrl: 'https://soroban-testnet.stellar.org'
    });
    const withdrawSrcAssembledTransaction = await escrowSrcClient.withdraw({secret, immutables: stellarSrcImmutables});
    const withdrawSrcTransaction = TransactionBuilder.fromXDR(withdrawSrcAssembledTransaction.toXDR(), Networks.TESTNET);
    withdrawSrcTransaction.sign(stellarKeypair);
    const withdrawSrcTransactionResp = await stellarServer.submitTransaction(withdrawSrcTransaction);
 

    return {
        srcEscrowCreation: createSrcTransactionResp.hash,
        dstEscrowCreation: createDstEscrowTx.hash,
        srcEscrowWithdrawal: withdrawSrcTransactionResp.hash,
        dstEscrowWithdrawal: dstWithdrawTx.hash,
    } as SwapResp
}

const main = async () => {
    const ethToStellarResp = await swapEthToStellar({
        maker: ETH_TAKER,
        makingAmount: 10n,
        receiver: STELLAR_TAKER,
        receivingAmount: 0n
    });
    console.log(ethToStellarResp);

    const stellarToEthResp = await swapStellarToEth({
        maker: STELLAR_TAKER,
        makingAmount: 0n,
        receiver: ETH_TAKER,
        receivingAmount: 10n
    });
    console.log(stellarToEthResp);
};