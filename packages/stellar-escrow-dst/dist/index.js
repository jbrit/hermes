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
    { factory }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ factory }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAAB2ZhY3RvcnkAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZzZWNyZXQAAAAAAA4AAAAAAAAACmltbXV0YWJsZXMAAAAAB9AAAAAKSW1tdXRhYmxlcwAAAAAAAA==",
            "AAAAAAAAAAAAAAAPcHVibGljX3dpdGhkcmF3AAAAAAIAAAAAAAAABnNlY3JldAAAAAAADgAAAAAAAAAKaW1tdXRhYmxlcwAAAAAH0AAAAApJbW11dGFibGVzAAAAAAAA",
            "AAAAAAAAAAAAAAAGY2FuY2VsAAAAAAABAAAAAAAAAAppbW11dGFibGVzAAAAAAfQAAAACkltbXV0YWJsZXMAAAAAAAA=",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAB0ZhY3RvcnkAAAAAAAAAAAAAAAANRXNjcm93U3JjSGFzaAAAAAAAAAAAAAAAAAAADUVzY3Jvd0RzdEhhc2gAAAA=",
            "AAAAAgAAAAAAAAAAAAAADVRpbWVCb3VuZEtpbmQAAAAAAAACAAAAAAAAAAAAAAAGQmVmb3JlAAAAAAAAAAAAAAAAAAVBZnRlcgAAAA==",
            "AAAAAQAAAAAAAAAAAAAACVRpbWVsb2NrcwAAAAAAAAgAAAAAAAAAC2RlcGxveWVkX2F0AAAAAAQAAAAAAAAAEGRzdF9jYW5jZWxsYXRpb24AAAAEAAAAAAAAABVkc3RfcHVibGljX3dpdGhkcmF3YWwAAAAAAAAEAAAAAAAAAA5kc3Rfd2l0aGRyYXdhbAAAAAAABAAAAAAAAAAQc3JjX2NhbmNlbGxhdGlvbgAAAAQAAAAAAAAAF3NyY19wdWJsaWNfY2FuY2VsbGF0aW9uAAAAAAQAAAAAAAAAFXNyY19wdWJsaWNfd2l0aGRyYXdhbAAAAAAAAAQAAAAAAAAADnNyY193aXRoZHJhd2FsAAAAAAAE",
            "AAAAAQAAAAAAAAAAAAAACkltbXV0YWJsZXMAAAAAAAgAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIaGFzaGxvY2sAAAPuAAAAIAAAAAAAAAAFbWFrZXIAAAAAAAATAAAAAAAAAApvcmRlcl9oYXNoAAAAAAPuAAAAIAAAAAAAAAAOc2FmZXR5X2RlcG9zaXQAAAAAAAsAAAAAAAAABXRha2VyAAAAAAAAEwAAAAAAAAAJdGltZWxvY2tzAAAAAAAH0AAAAAlUaW1lbG9ja3MAAAAAAAAAAAAABXRva2VuAAAAAAAAEw=="]), options);
        this.options = options;
    }
    fromJSON = {
        withdraw: (this.txFromJSON),
        public_withdraw: (this.txFromJSON),
        cancel: (this.txFromJSON)
    };
}
