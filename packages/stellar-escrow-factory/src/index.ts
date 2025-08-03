import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type DataKey = {tag: "Factory", values: void} | {tag: "EscrowSrcHash", values: void} | {tag: "EscrowDstHash", values: void};

export type TimeBoundKind = {tag: "Before", values: void} | {tag: "After", values: void};


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
  create_src_escrow: ({immutables}: {immutables: Immutables}, options?: {
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
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a create_dst_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_dst_escrow: ({immutables, src_cancellation_timestamp}: {immutables: Immutables, src_cancellation_timestamp: u32}, options?: {
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
  }) => Promise<AssembledTransaction<string>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {escrow_src_hash, escrow_dst_hash}: {escrow_src_hash: Buffer, escrow_dst_hash: Buffer},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({escrow_src_hash, escrow_dst_hash}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAAD2VzY3Jvd19zcmNfaGFzaAAAAAPuAAAAIAAAAAAAAAAPZXNjcm93X2RzdF9oYXNoAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAAAAAAARY3JlYXRlX3NyY19lc2Nyb3cAAAAAAAABAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAEAAAAT",
        "AAAAAAAAAAAAAAARY3JlYXRlX2RzdF9lc2Nyb3cAAAAAAAACAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAAAAAAac3JjX2NhbmNlbGxhdGlvbl90aW1lc3RhbXAAAAAAAAQAAAABAAAAEw==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAB0ZhY3RvcnkAAAAAAAAAAAAAAAANRXNjcm93U3JjSGFzaAAAAAAAAAAAAAAAAAAADUVzY3Jvd0RzdEhhc2gAAAA=",
        "AAAAAgAAAAAAAAAAAAAADVRpbWVCb3VuZEtpbmQAAAAAAAACAAAAAAAAAAAAAAAGQmVmb3JlAAAAAAAAAAAAAAAAAAVBZnRlcgAAAA==",
        "AAAAAQAAAAAAAAAAAAAACVRpbWVsb2NrcwAAAAAAAAgAAAAAAAAAC2RlcGxveWVkX2F0AAAAAAQAAAAAAAAAEGRzdF9jYW5jZWxsYXRpb24AAAAEAAAAAAAAABVkc3RfcHVibGljX3dpdGhkcmF3YWwAAAAAAAAEAAAAAAAAAA5kc3Rfd2l0aGRyYXdhbAAAAAAABAAAAAAAAAAQc3JjX2NhbmNlbGxhdGlvbgAAAAQAAAAAAAAAF3NyY19wdWJsaWNfY2FuY2VsbGF0aW9uAAAAAAQAAAAAAAAAFXNyY19wdWJsaWNfd2l0aGRyYXdhbAAAAAAAAAQAAAAAAAAADnNyY193aXRoZHJhd2FsAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAACkltbXV0YWJsZXMAAAAAAAgAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIaGFzaGxvY2sAAAPuAAAAIAAAAAAAAAAFbWFrZXIAAAAAAAATAAAAAAAAAApvcmRlcl9oYXNoAAAAAAPuAAAAIAAAAAAAAAAOc2FmZXR5X2RlcG9zaXQAAAAAAAsAAAAAAAAABXRha2VyAAAAAAAAEwAAAAAAAAAJdGltZWxvY2tzAAAAAAAH0AAAAAlUaW1lbG9ja3MAAAAAAAAAAAAABXRva2VuAAAAAAAAEw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_src_escrow: this.txFromJSON<string>,
        create_dst_escrow: this.txFromJSON<string>
  }
}