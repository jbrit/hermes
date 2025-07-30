import { Select } from "@headlessui/react";

interface AssetSelectorProps {
  assets: string[];
  selectedAsset: string;
  onAssetChange: (value: string) => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets = [],
  selectedAsset,
  onAssetChange,
}) => {
  return (
    <Select
      className="my-2"
      name="asset"
      aria-label="From Asset"
      value={selectedAsset}
      onChange={(e) => onAssetChange(e.target.value)}
    >
      {assets.map((asset) => (
        <option key={asset} value={asset}>
          {asset}
        </option>
      ))}
    </Select>
  );
};
export default AssetSelector;
