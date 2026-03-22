import { NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing');
      return NextResponse.json({ error: 'AI Configuration missing' }, { status: 500 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Help the user manage their tasks, subjects, and study sessions.',
        },
        ...messages,
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content: responseContent }, { status: 200 });
  } catch (error) {
    console.error('Groq AI Error Details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch AI response',
      details: error.message 
    }, { status: 500 });
  }
}
