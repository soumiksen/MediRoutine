import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY, // Store key in .env.local
  });

  const { imageBase64, mimeType = 'image/jpeg' } = await request.json();

  const contents = [
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    {
      text: "Analyze the image and extract the following information: type: 'medication', name: '', dosage: '', time: '', frequency: 'daily', instructions: '', withFood: false, beforeFood: false, afterFood: false, Give the response in JSON format with these fields filled out based on the image analysis. If any information is not present in the image, use empty strings or false as appropriate.",
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
  });

  return NextResponse.json({ result: response.text });
}
