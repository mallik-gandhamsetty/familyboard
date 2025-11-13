import { transcribeAudio } from "./_core/voiceTranscription";

/**
 * Transcribe audio blob to text using Whisper API
 */
export async function transcribeVoiceMessage(audioUrl: string, language?: string): Promise<string> {
  try {
    const result = await transcribeAudio({
      audioUrl,
      language: language || "en",
      prompt: "This is a family coordination assistant. Transcribe commands for calendar, tasks, meals, and lists.",
    });

    if ("text" in result) {
      return result.text || "";
    }
    throw new Error("Transcription failed");
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

/**
 * Parse voice command and extract intent and parameters
 * Examples:
 * - "Add dentist appointment Thursday 3 PM" -> { intent: "create_event", params: { title: "dentist", date: "Thursday", time: "3 PM" } }
 * - "Mark homework as done" -> { intent: "complete_task", params: { taskName: "homework" } }
 * - "Add milk to grocery list" -> { intent: "add_list_item", params: { item: "milk", list: "grocery" } }
 */
export function parseVoiceCommand(
  text: string
): {
  intent: string;
  params: Record<string, string>;
} {
  const lowerText = text.toLowerCase();

  // Calendar intents
  if (
    lowerText.includes("add") &&
    (lowerText.includes("appointment") || lowerText.includes("event") || lowerText.includes("meeting"))
  ) {
    return {
      intent: "create_event",
      params: { text },
    };
  }

  // Task intents
  if (
    lowerText.includes("mark") &&
    (lowerText.includes("done") || lowerText.includes("complete") || lowerText.includes("finished"))
  ) {
    return {
      intent: "complete_task",
      params: { text },
    };
  }

  if (lowerText.includes("add") && lowerText.includes("task")) {
    return {
      intent: "create_task",
      params: { text },
    };
  }

  // List intents
  if (lowerText.includes("add") && (lowerText.includes("list") || lowerText.includes("grocery"))) {
    return {
      intent: "add_list_item",
      params: { text },
    };
  }

  // Query intents
  if (lowerText.includes("what") || lowerText.includes("show") || lowerText.includes("tell")) {
    if (lowerText.includes("schedule") || lowerText.includes("event")) {
      return {
        intent: "query_events",
        params: { text },
      };
    }
    if (lowerText.includes("task") || lowerText.includes("chore")) {
      return {
        intent: "query_tasks",
        params: { text },
      };
    }
    if (lowerText.includes("meal") || lowerText.includes("dinner") || lowerText.includes("lunch")) {
      return {
        intent: "query_meals",
        params: { text },
      };
    }
  }

  // Default: treat as general query
  return {
    intent: "general_query",
    params: { text },
  };
}

/**
 * Generate natural language response for voice output
 */
export function generateVoiceResponse(action: string, details: string): string {
  const responses: Record<string, (details: string) => string> = {
    event_created: (details) => `I've added ${details} to your calendar.`,
    task_created: (details) => `I've created a task: ${details}.`,
    task_completed: (details) => `Great! I've marked ${details} as done.`,
    list_item_added: (details) => `I've added ${details} to your list.`,
    event_retrieved: (details) => `Here are your upcoming events: ${details}.`,
    task_retrieved: (details) => `You have these pending tasks: ${details}.`,
    meal_retrieved: (details) => `Your meal plan includes: ${details}.`,
    error: (details) => `Sorry, I couldn't ${details}. Please try again.`,
  };

  const generator = responses[action] || ((d) => d);
  return generator(details);
}
