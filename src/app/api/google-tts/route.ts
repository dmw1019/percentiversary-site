import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Standard-F' },
        audioConfig: { audioEncoding: 'MP3' },
      }
    );

    return NextResponse.json({ audioContent: response.data.audioContent });
  } catch (error) {
    console.error('Error with Google TTS:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
