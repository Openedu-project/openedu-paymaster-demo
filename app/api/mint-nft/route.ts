import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'mvYHRnSa7qL15JKbZp3wfNreFGxtDhPoQVuT2yesUC8kj4izM6xcBsA5rmXLlSPd';
const API_ENDPOINT = 'https://opendu-paymaster-production.up.railway.app/api/v1/mint-nft';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiver_address, token_uri } = body;

    if (!receiver_address || !token_uri) {
      return NextResponse.json(
        { error: 'Missing required fields: receiver_address or token_uri' },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log('Minting NFT with:', { receiver_address, token_uri });

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        receiver_address,
        token_uri,
      }),
    });

    // Get the response text first
    const responseText = await response.text();
    console.log('API Response:', responseText);

    // Try to parse the JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid response from minting service',
          details: responseText
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to mint NFT' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error minting NFT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
