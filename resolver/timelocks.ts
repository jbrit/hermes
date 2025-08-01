export interface Timelocks {
  src_withdrawal: number;
  src_public_withdrawal: number;
  src_cancellation: number;
  src_public_cancellation: number;
  dst_withdrawal: number;
  dst_public_withdrawal: number;
  dst_cancellation: number;
  deployed_at: number;
}

export function decodeTimelocks(encoded: bigint): Timelocks {
  const toU32 = (val: bigint) => Number(val & 0xffffffffn);

  return {
    src_withdrawal: toU32(encoded >> BigInt(0)),
    src_public_withdrawal: toU32(encoded >> BigInt(32)),
    src_cancellation: toU32(encoded >> BigInt(64)),
    src_public_cancellation: toU32(encoded >> BigInt(96)),
    dst_withdrawal: toU32(encoded >> BigInt(128)),
    dst_public_withdrawal: toU32(encoded >> BigInt(160)),
    dst_cancellation: toU32(encoded >> BigInt(192)),
    deployed_at: toU32(encoded >> BigInt(224)),
  };
}

export function encodeTimelocks(obj: Timelocks): bigint {
  const toBigInt = (val: number) => BigInt(val) & 0xffffffffn;

  return (
    (toBigInt(obj.src_withdrawal) << 0n) |
    (toBigInt(obj.src_public_withdrawal) << 32n) |
    (toBigInt(obj.src_cancellation) << 64n) |
    (toBigInt(obj.src_public_cancellation) << 96n) |
    (toBigInt(obj.dst_withdrawal) << 128n) |
    (toBigInt(obj.dst_public_withdrawal) << 160n) |
    (toBigInt(obj.dst_cancellation) << 192n) |
    (toBigInt(obj.deployed_at) << 224n)
  );
}
