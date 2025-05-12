'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenURI, setTokenURI] = useState('https://brown-interesting-eel-440.mypinata.cloud/ipfs/bafkreihh5xmatthhijqeyf7ga2je6q7tox757ss7jhdjkmcqazrmohuwnu');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Check if wallet is already connected when the page loads
  useEffect(() => {
    setMounted(true);

    const checkIfWalletIsConnected = async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
          // Use a safer approach with explicit error handling
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          }).catch((err: any) => {
            console.error('Error in eth_accounts request:', err?.message || 'Unknown error');
            return []; // Return empty array on error
          });

          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error: any) {
          console.error('Error checking wallet connection:', error?.message || 'Unknown error');
          // Don't show error to user on initial load - just log it
        }
      }
    };

    checkIfWalletIsConnected();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress(null);
      }
    };

    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Also listen for chain changes
      window.ethereum.on('chainChanged', () => {
        // Reload the page when the chain changes
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    // Clear any previous errors
    setError(null);

    if (typeof window !== 'undefined') {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        try {
          // For the specific case of pending requests, we can try to get accounts first
          // This might work if the user has already approved the connection
          if (window.ethereum.selectedAddress) {
            setWalletAddress(window.ethereum.selectedAddress);
            return;
          }

          // Wrap the request in a try-catch to handle any errors
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          }).catch((err: any) => {
            // This catch will handle promise rejections
            if (err?.code === 4001) {
              throw new Error('User rejected the connection request');
            } else if (err?.code === -32002) {
              // For pending requests, we can show a more helpful message
              throw new Error('A connection request is already pending in your wallet. Please open your wallet and approve the connection.');
            } else {
              throw new Error(err?.message || 'Unknown wallet connection error');
            }
          });

          // Check if accounts were returned
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setError('No accounts found. Please create an account in your wallet.');
          }
        } catch (error: any) {
          // This will catch both synchronous errors and errors thrown in the catch above
          const errorMessage = error?.message || 'Failed to connect wallet. Please try again.';

          // Don't log the error for pending requests to avoid console noise
          if (!errorMessage.includes('already pending')) {
            console.error('Error connecting wallet:', errorMessage);
          }

          setError(errorMessage);
        }
      } else {
        setError('No Ethereum wallet detected. Please install MetaMask or another Ethereum wallet extension.');
      }
    } else {
      setError('Browser environment not available');
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Mint NFT function
  const mintNFT = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenURI) {
      setError('Please enter a token URI');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Minting NFT with address:', walletAddress, 'and token URI:', tokenURI);

      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_address: walletAddress,
          token_uri: tokenURI,
        }),
      });

      // First check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid response format' }));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      // If we get here, the response was ok, so we can safely parse the JSON
      const data = await response.json();
      console.log('Mint successful:', data);
      setResult(data);

      // Show alert with explorer link
      if (data.data?.tx_hash) {
        setShowAlert(true);
        // Auto-hide alert after 10 seconds
        setTimeout(() => setShowAlert(false), 10000);
      }
    } catch (err: any) {
      console.error('Error minting NFT:', err);
      setError(err?.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only render UI after component has mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Success Alert */}
      {showAlert && result?.data?.tx_hash && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
          <div className="rounded-lg bg-green-100 p-4 shadow-lg dark:bg-green-900">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0">
                <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 pr-6">
                <p className="font-medium text-green-800 dark:text-green-200">NFT Minted Successfully!</p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  <a
                    href={`https://sepolia.basescan.org/tx/${result.data.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    View on BaseScan
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">OpenEdu NFT</h1>
          </div>
          <div className="flex items-center">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatAddress(walletAddress)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">OpenEdu NFT Minting</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Connect your wallet and mint your NFT
          </p>
        </div>

        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Mint NFT</h2>

          {!walletAddress ? (
            <div className="mb-6 flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-yellow-100 p-3 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Wallet Not Connected</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Please connect your wallet to mint NFTs
              </p>

              {error && (
                <div className="w-full rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={connectWallet}
                className="mt-2 rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="tokenURI" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Token URI
                </label>
                <input
                  type="text"
                  id="tokenURI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="https://example.com/metadata.json"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Token URI is pre-filled with the provided IPFS link
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400">
                  {error}
                </div>
              )}

              {result && result.code === 200 && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-gray-800 dark:text-green-400">
                  <p className="font-medium">NFT Minted Successfully!</p>
                  {result.data && (
                    <div className="mt-2 overflow-x-auto text-xs space-y-2">
                      <p>Transaction Hash: {result.data.tx_hash}</p>
                      <p>Block Number: {result.data.block_number}</p>
                      <p className="pt-2">
                        <a
                          href={`https://sepolia.basescan.org/tx/${result.data.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View on BaseScan
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={mintNFT}
                disabled={isLoading || !tokenURI}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} OpenEdu NFT. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
