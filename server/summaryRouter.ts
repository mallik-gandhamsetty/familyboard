import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getFamilyByUserId,
  getCalendarEvents,
  getFamilyTasks,
  getMealPlans,
} from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";

export const summaryRouter = router({
  /**
   * Generate daily brief
   */
  generateDailyBrief: protectedProcedure.query(async ({ ctx }) => {
    const family = await getFamilyByUserId(ctx.user.id);
    if (!family) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Family not found",
      });
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Fetch today's data
    const events = await getCalendarEvents(family.id, startOfToday, endOfToday);
    const tasks = await getFamilyTasks(family.id);
    const meals = await getMealPlans(family.id, today);

    const pendingTasks = tasks.filter((t) => t.status === "pending");
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    // Generate summary with LLM
    const prompt = `Generate a friendly, concise daily brief for the ${family.name} family.

Today: ${format(today, "EEEE, MMMM d, yyyy")}

Events (${events.length}):
${events.map((e) => `- ${e.title} at ${format(new Date(e.startTime), "h:mm a")}`).join("\n") || "None"}

Pending Tasks (${pendingTasks.length}):
${pendingTasks.map((t) => `- ${t.title} (${t.priority} priority)`).join("\n") || "All caught up!"}

Meals Planned (${meals.length}):
${meals.map((m) => `- ${m.mealType}: ${m.meal}`).join("\n") || "No meals planned"}

Tasks Completed Today: ${completedTasks}

Create a warm, encouraging summary that:
1. Greets the family
2. Highlights key events
3. Reminds about pending tasks
4. Mentions meals
5. Ends with an encouraging note

Keep it under 100 words.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a friendly family assistant creating daily briefings.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    const summary = typeof content === "string" ? content : "Unable to generate summary";

    return {
      type: "daily",
      date: today,
      summary,
      eventCount: events.length,
      taskCount: pendingTasks.length,
      mealCount: meals.length,
    };
  }),

  /**
   * Generate weekly recap
   */
  generateWeeklyRecap: protectedProcedure.query(async ({ ctx }) => {
    const family = await getFamilyByUserId(ctx.user.id);
    if (!family) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Family not found",
      });
    }

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    // Fetch week's data
    const events = await getCalendarEvents(family.id, weekStart, weekEnd);
    const tasks = await getFamilyTasks(family.id);
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt &&
        new Date(t.completedAt) >= weekStart
    ).length;

    // Generate summary with LLM
    const prompt = `Generate an engaging weekly recap for the ${family.name} family.

Week of: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}

Total Events: ${events.length}
Tasks Completed: ${completedThisWeek}

Key Events:
${events
  .slice(0, 5)
  .map((e) => `- ${e.title} on ${format(new Date(e.startTime), "EEEE")}`)
  .join("\n")}

Create a warm, celebratory weekly recap that:
1. Celebrates accomplishments
2. Highlights key events
3. Acknowledges completed tasks
4. Suggests planning for next week
5. Ends with encouragement

Keep it under 150 words.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a warm, encouraging family assistant creating weekly recaps.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    const summary = typeof content === "string" ? content : "Unable to generate recap";

    return {
      type: "weekly",
      weekStart,
      weekEnd,
      summary,
      eventCount: events.length,
      tasksCompleted: completedThisWeek,
    };
  }),

  /**
   * Generate mood-based suggestions
   */
  generateMoodSuggestions: protectedProcedure
    .input(z.object({ mood: z.enum(["calm", "busy", "exciting", "relaxed"]) }))
    .query(async ({ input }) => {
      const moodSuggestions: Record<string, string> = {
        calm: `🧘 Calm Mode: Try soft background music, take deep breaths, and focus on one task at a time. Consider a relaxing activity like reading or gentle stretching.`,
        busy: `⚡ Busy Mode: You've got a lot going on! Break tasks into smaller chunks, take short breaks, and don't forget to hydrate. You're doing great!`,
        exciting: `🎉 Exciting Mode: Channel that energy! This is a great time to tackle challenging tasks or plan something fun for the family.`,
        relaxed: `😌 Relaxed Mode: Perfect time for planning, creative thinking, or quality family time. Enjoy the moment!`,
      };

      return {
        mood: input.mood,
        suggestion: moodSuggestions[input.mood],
        recommendations: [
          "Take a 5-minute break",
          "Drink some water",
          "Step outside for fresh air",
          "Connect with a family member",
        ],
      };
    }),
});
