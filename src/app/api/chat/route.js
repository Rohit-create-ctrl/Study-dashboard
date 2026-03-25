import { NextResponse } from 'next/server';
import groq from '@/lib/groq';

const CHAT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are StudyChat, a study helper.
Rules you must follow for every reply:
- Keep replies short: 2 to 3 sentences maximum.
- Use simple, friendly language like talking to a friend.
- Do not use bullet points, numbered lists, or long explanations.
- Stay focused on study help only.
- Output only the answer text.`;

function normalizeAssistantReply(content) {
  if (typeof content !== 'string') return '';

  const cleaned = content
    .replace(/[\r\n]+/g, ' ')
    .replace(/^\s*[-*\d.\)]\s+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return sentences.slice(0, 3).join(' ').trim();
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing');
      return NextResponse.json({ error: 'AI service is not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const messages = body?.messages;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const sanitizedMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content.trim() }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...sanitizedMessages,
      ],
      model: CHAT_MODEL,
      temperature: 0.2,
      max_tokens: 120,
    });

    const responseContent = normalizeAssistantReply(completion?.choices?.[0]?.message?.content);

    if (!responseContent) {
      return NextResponse.json({ error: 'AI returned an empty response' }, { status: 502 });
    }

    return NextResponse.json({ content: responseContent }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Groq AI Error:', message);
    return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 });
  }
}
