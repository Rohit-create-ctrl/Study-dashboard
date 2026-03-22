import { NextResponse } from "next/server";
import groq from "@/lib/groq";

export async function POST(req) {
  try {
    const { syllabus, subjectName } = await req.json();

    if (!syllabus || !Array.isArray(syllabus) || syllabus.length === 0) {
      return NextResponse.json(
        { error: "Syllabus items are required." },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful study assistant. A student is studying "${subjectName}" and has the following syllabus topics:\n\n${syllabus.join("\n")}\n\nConvert this syllabus into a list of 5-10 actionable study tasks for the student. Keep tasks short, clear, and specific. Return ONLY a valid JSON array of strings. Example: ["Task 1", "Task 2"]. No other text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Return ONLY JSON arrays.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192',
      response_format: { type: "json_object" } // Groq supports JSON mode
    });

    const text = completion.choices[0]?.message?.content || "";
    
    // Parse the JSON array from the response
    let tasks;
    try {
        const parsed = JSON.parse(text);
        tasks = parsed.tasks || parsed; // Handle { tasks: [...] } or [...]
    } catch (e) {
        // Fallback for non-json mode or parsing errors
        const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        tasks = JSON.parse(cleaned);
    }

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "AI returned invalid format." },
        { status: 502 }
      );
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Generate tasks error:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks." },
      { status: 500 }
    );
  }
}
