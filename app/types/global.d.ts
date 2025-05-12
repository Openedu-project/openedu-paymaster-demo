// Type definitions for Ethereum provider
interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
  isConnected?: () => boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  enable?: () => Promise<string[]>;
}

// Extend the Window interface
interface Window {
  ethereum?: EthereumProvider;
}
