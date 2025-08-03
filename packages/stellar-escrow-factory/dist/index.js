import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { escrow_src_hash, escrow_dst_hash }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ escrow_src_hash, escrow_dst_hash }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAAD2VzY3Jvd19zcmNfaGFzaAAAAAPuAAAAIAAAAAAAAAAPZXNjcm93X2RzdF9oYXNoAAAAA+4AAAAgAAAAAA==",
            "AAAAAAAAAAAAAAARY3JlYXRlX3NyY19lc2Nyb3cAAAAAAAABAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAEAAAAT",
            "AAAAAAAAAAAAAAARY3JlYXRlX2RzdF9lc2Nyb3cAAAAAAAACAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAAAAAAac3JjX2NhbmNlbGxhdGlvbl90aW1lc3RhbXAAAAAAAAQAAAABAAAAEw==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAB0ZhY3RvcnkAAAAAAAAAAAAAAAANRXNjcm93U3JjSGFzaAAAAAAAAAAAAAAAAAAADUVzY3Jvd0RzdEhhc2gAAAA=",
            "AAAAAgAAAAAAAAAAAAAADVRpbWVCb3VuZEtpbmQAAAAAAAACAAAAAAAAAAAAAAAGQmVmb3JlAAAAAAAAAAAAAAAAAAVBZnRlcgAAAA==",
            "AAAAAQAAAAAAAAAAAAAACVRpbWVsb2NrcwAAAAAAAAgAAAAAAAAAC2RlcGxveWVkX2F0AAAAAAQAAAAAAAAAEGRzdF9jYW5jZWxsYXRpb24AAAAEAAAAAAAAABVkc3RfcHVibGljX3dpdGhkcmF3YWwAAAAAAAAEAAAAAAAAAA5kc3Rfd2l0aGRyYXdhbAAAAAAABAAAAAAAAAAQc3JjX2NhbmNlbGxhdGlvbgAAAAQAAAAAAAAAF3NyY19wdWJsaWNfY2FuY2VsbGF0aW9uAAAAAAQAAAAAAAAAFXNyY19wdWJsaWNfd2l0aGRyYXdhbAAAAAAAAAQAAAAAAAAADnNyY193aXRoZHJhd2FsAAAAAAAE",
            "AAAAAQAAAAAAAAAAAAAACkltbXV0YWJsZXMAAAAAAAgAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIaGFzaGxvY2sAAAPuAAAAIAAAAAAAAAAFbWFrZXIAAAAAAAATAAAAAAAAAApvcmRlcl9oYXNoAAAAAAPuAAAAIAAAAAAAAAAOc2FmZXR5X2RlcG9zaXQAAAAAAAsAAAAAAAAABXRha2VyAAAAAAAAEwAAAAAAAAAJdGltZWxvY2tzAAAAAAAH0AAAAAlUaW1lbG9ja3MAAAAAAAAAAAAABXRva2VuAAAAAAAAEw=="]), options);
        this.options = options;
    }
    fromJSON = {
        create_src_escrow: (this.txFromJSON),
        create_dst_escrow: (this.txFromJSON)
    };
}
