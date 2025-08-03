import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, i128 } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export type DataKey = {
    tag: "Factory";
    values: void;
} | {
    tag: "EscrowSrcHash";
    values: void;
} | {
    tag: "EscrowDstHash";
    values: void;
};
export type TimeBoundKind = {
    tag: "Before";
    values: void;
} | {
    tag: "After";
    values: void;
};
export interface Timelocks {
    deployed_at: u32;
    dst_cancellation: u32;
    dst_public_withdrawal: u32;
    dst_withdrawal: u32;
    src_cancellation: u32;
    src_public_cancellation: u32;
    src_public_withdrawal: u32;
    src_withdrawal: u32;
}
export interface Immutables {
    amount: i128;
    hashlock: Buffer;
    maker: string;
    order_hash: Buffer;
    safety_deposit: i128;
    taker: string;
    timelocks: Timelocks;
    token: string;
}
export interface Client {
    /**
     * Construct and simulate a create_src_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_src_escrow: ({ immutables }: {
        immutables: Immutables;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a create_dst_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_dst_escrow: ({ immutables, src_cancellation_timestamp }: {
        immutables: Immutables;
        src_cancellation_timestamp: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<string>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { escrow_src_hash, escrow_dst_hash }: {
        escrow_src_hash: Buffer;
        escrow_dst_hash: Buffer;
    }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        create_src_escrow: (json: string) => AssembledTransaction<string>;
        create_dst_escrow: (json: string) => AssembledTransaction<string>;
    };
}
