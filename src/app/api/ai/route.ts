import { NextResponse } from 'next/server';

// This is a server-side API route that will use Gemini API
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }
    
    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: query,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });
    
    const data = await response.json();
    
    // Check if the response is valid
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get response from Gemini API', details: data },
        { status: response.status }
      );
    }
    
    // Extract the text from the response
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}