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
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: ({secret, immutables}: {secret: Buffer, immutables: Immutables}, options?: {
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
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a public_withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  public_withdraw: ({secret, immutables}: {secret: Buffer, immutables: Immutables}, options?: {
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
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel: ({immutables}: {immutables: Immutables}, options?: {
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
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {factory}: {factory: string},
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
    return ContractClient.deploy({factory}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAAB2ZhY3RvcnkAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZzZWNyZXQAAAAAAA4AAAAAAAAACmltbXV0YWJsZXMAAAAAB9AAAAAKSW1tdXRhYmxlcwAAAAAAAA==",
        "AAAAAAAAAAAAAAAPcHVibGljX3dpdGhkcmF3AAAAAAIAAAAAAAAABnNlY3JldAAAAAAADgAAAAAAAAAKaW1tdXRhYmxlcwAAAAAH0AAAAApJbW11dGFibGVzAAAAAAAA",
        "AAAAAAAAAAAAAAAGY2FuY2VsAAAAAAABAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAB0ZhY3RvcnkAAAAAAAAAAAAAAAANRXNjcm93U3JjSGFzaAAAAAAAAAAAAAAAAAAADUVzY3Jvd0RzdEhhc2gAAAA=",
        "AAAAAgAAAAAAAAAAAAAADVRpbWVCb3VuZEtpbmQAAAAAAAACAAAAAAAAAAAAAAAGQmVmb3JlAAAAAAAAAAAAAAAAAAVBZnRlcgAAAA==",
        "AAAAAQAAAAAAAAAAAAAACVRpbWVsb2NrcwAAAAAAAAgAAAAAAAAAC2RlcGxveWVkX2F0AAAAAAQAAAAAAAAAEGRzdF9jYW5jZWxsYXRpb24AAAAEAAAAAAAAABVkc3RfcHVibGljX3dpdGhkcmF3YWwAAAAAAAAEAAAAAAAAAA5kc3Rfd2l0aGRyYXdhbAAAAAAABAAAAAAAAAAQc3JjX2NhbmNlbGxhdGlvbgAAAAQAAAAAAAAAF3NyY19wdWJsaWNfY2FuY2VsbGF0aW9uAAAAAAQAAAAAAAAAFXNyY19wdWJsaWNfd2l0aGRyYXdhbAAAAAAAAAQAAAAAAAAADnNyY193aXRoZHJhd2FsAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAACkltbXV0YWJsZXMAAAAAAAgAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIaGFzaGxvY2sAAAPuAAAAIAAAAAAAAAAFbWFrZXIAAAAAAAATAAAAAAAAAApvcmRlcl9oYXNoAAAAAAPuAAAAIAAAAAAAAAAOc2FmZXR5X2RlcG9zaXQAAAAAAAsAAAAAAAAABXRha2VyAAAAAAAAEwAAAAAAAAAJdGltZWxvY2tzAAAAAAAH0AAAAAlUaW1lbG9ja3MAAAAAAAAAAAAABXRva2VuAAAAAAAAEw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    withdraw: this.txFromJSON<null>,
        public_withdraw: this.txFromJSON<null>,
        cancel: this.txFromJSON<null>
  }
}