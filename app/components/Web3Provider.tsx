'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { ReactNode, useState, useEffect } from 'react';

// Using a placeholder project ID - in a real app, you would get this from https://cloud.walletconnect.com
// and store it in an environment variable
const projectId = 'a8b963008c9d724fd8d91ea044e73a99';

// Create wagmiConfig
const metadata = {
  name: 'OpenEdu NFT',
  description: 'OpenEdu NFT Minting Platform',
  url: 'https://openedu.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Define chains array properly
const chains = [mainnet] as const;

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wagmiConfig] = useState(() =>
    createConfig({
      chains,
      transports: {
        [mainnet.id]: http(),
      },
    })
  );

  // Initialize Web3Modal on the client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      createWeb3Modal({
        wagmiConfig,
        projectId,
        metadata,
      });
      setMounted(true);
    }
  }, [wagmiConfig]);

  // Only render children when mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      {children}
    </WagmiProvider>
  );
}
