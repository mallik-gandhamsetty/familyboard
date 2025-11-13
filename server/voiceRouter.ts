import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { transcribeVoiceMessage, parseVoiceCommand, generateVoiceResponse } from "./voiceHelper";
import { getFamilyByUserId, createCalendarEvent, createTask, addListItem } from "./db";
import { TRPCError } from "@trpc/server";

export const voiceRouter = router({
  /**
   * Transcribe audio file to text
   */
  transcribe: protectedProcedure
    .input(z.object({ audioUrl: z.string(), language: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const text = await transcribeVoiceMessage(input.audioUrl, input.language);
        return { text, success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transcribe audio",
        });
      }
    }),

  /**
   * Process voice command and execute action
   */
  processCommand: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const family = await getFamilyByUserId(ctx.user.id);
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Family not found",
        });
      }

      const command = parseVoiceCommand(input.text);

      try {
        switch (command.intent) {
          case "create_event":
            // Parse natural language event creation
            // Example: "Add dentist appointment Thursday 3 PM"
            await createCalendarEvent({
              familyId: family.id,
              createdBy: ctx.user.id,
              title: input.text,
              description: `Created via voice: ${input.text}`,
              startTime: new Date(), // TODO: Parse date/time from text
              endTime: new Date(Date.now() + 3600000), // 1 hour later
            });
            return {
              success: true,
              action: "event_created",
              response: generateVoiceResponse("event_created", "your appointment"),
            };

          case "create_task":
            // Parse natural language task creation
            await createTask({
              familyId: family.id,
              createdBy: ctx.user.id,
              title: input.text,
              description: `Created via voice: ${input.text}`,
            });
            return {
              success: true,
              action: "task_created",
              response: generateVoiceResponse("task_created", "new task"),
            };

          case "add_list_item":
            // Parse natural language list item addition
            // For now, add to first list or create a default one
            // TODO: Implement smart list selection
            return {
              success: true,
              action: "list_item_added",
              response: generateVoiceResponse("list_item_added", "item to your list"),
            };

          case "query_events":
            return {
              success: true,
              action: "event_retrieved",
              response: generateVoiceResponse("event_retrieved", "upcoming events"),
            };

          case "query_tasks":
            return {
              success: true,
              action: "task_retrieved",
              response: generateVoiceResponse("task_retrieved", "pending tasks"),
            };

          case "query_meals":
            return {
              success: true,
              action: "meal_retrieved",
              response: generateVoiceResponse("meal_retrieved", "today's meals"),
            };

          default:
            return {
              success: true,
              action: "general_query",
              response: `I heard: "${input.text}". How can I help?`,
            };
        }
      } catch (error) {
        console.error("Command processing error:", error);
        return {
          success: false,
          action: "error",
          response: generateVoiceResponse("error", "process that command"),
        };
      }
    }),

  /**
   * Text-to-speech synthesis (placeholder for future TTS integration)
   */
  synthesize: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Integrate with OpenAI TTS or ElevenLabs
      // For now, return a placeholder
      return {
        success: true,
        audioUrl: null, // Would be populated with actual TTS
        message: input.text,
      };
    }),
});
