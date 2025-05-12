'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

// Using our internal API route that will handle the API key
const API_ENDPOINT = '/api/mint-nft';

interface MintResponse {
  code: number;
  message: string;
  data?: {
    status: string;
    tx_hash: string;
    user_op_hash: string;
    block_number: string;
    block_hash: string;
    timestamp: number;
  };
  error?: string;
}

export default function MintNFT() {
  const { address, isConnected } = useAccount();
  const [tokenURI, setTokenURI] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MintResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!isConnected || !address) {
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
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_address: address,
          token_uri: tokenURI,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(data.message || 'Failed to mint NFT');
      }
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError('Failed to mint NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Mint NFT</h2>

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
          disabled={isLoading || !isConnected}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter the URI for your NFT metadata
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
            <div className="mt-2 overflow-x-auto text-xs">
              <p>Transaction Hash: {result.data.tx_hash}</p>
              <p>Block Number: {result.data.block_number}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={isLoading || !isConnected || !tokenURI}
        className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        {isLoading ? 'Minting...' : 'Mint NFT'}
      </button>

      {!isConnected && (
        <p className="mt-2 text-center text-sm text-red-500">
          Please connect your wallet to mint NFTs
        </p>
      )}
    </div>
  );
}
