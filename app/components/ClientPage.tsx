'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Web3Provider from "./Web3Provider";

// Use dynamic import for components that use client-side only features
const ConnectWallet = dynamic(() => import("./ConnectWallet"));
const MintNFT = dynamic(() => import("./MintNFT"));
const Web3Modal = dynamic(
  () => import("@web3modal/react").then((mod) => mod.Web3Modal),
  { ssr: false }
);

export default function ClientPage() {
  const [mounted, setMounted] = useState(false);

  // Only show the UI after the component has mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Web3Provider>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">OpenEdu NFT</h1>
            </div>
            <ConnectWallet />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">OpenEdu NFT Minting Platform</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect your wallet and mint your NFT
            </p>
          </div>

          <MintNFT />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} OpenEdu NFT. All rights reserved.
          </p>
        </footer>

        {/* Web3Modal Component (required for wallet connection) */}
        <Web3Modal projectId="a8b963008c9d724fd8d91ea044e73a99" />
      </div>
    </Web3Provider>
  );
}
