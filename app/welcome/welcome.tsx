import hermesLogo from "./hermes.svg";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Welcome() {
  return (
    <>
      <nav className="border border-gray-200 py-4 px-16 flex items-center justify-between mb-4">
        <div className="flex-shrink-0">
          <img src={hermesLogo} alt="Hermes" className="h-24 w-auto" />
        </div>
        <div className="flex-shrink-0 ml-auto mr-2">
          <ConnectButton label="ETH Connect"/>
          </div>
        <div className="flex-shrink-0">
          <ConnectButton label="ETH Connect"/>
        </div>
      </nav>
    </>
  );
}