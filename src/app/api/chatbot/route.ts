// src/app/api/chatbot/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I didn\'t understand that.';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return NextResponse.json({ error: 'Failed to fetch response from OpenAI API' }, { status: 500 });
  }
}
