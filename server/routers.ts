import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getFamilyByUserId,
  getFamilyMembers,
  createFamily,
  addFamilyMember,
  getCalendarEvents,
  createCalendarEvent,
  getFamilyTasks,
  createTask,
  updateTask,
  getFamilyLists,
  getListItems,
  createList,
  addListItem,
  getMealPlans,
  createMealPlan,
  getChatHistory,
  addChatMessage,
  createNotification,
  getUserNotifications,
} from "./db";
import { TRPCError } from "@trpc/server";
import { voiceRouter } from "./voiceRouter";
import { summaryRouter } from "./summaryRouter";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  voice: voiceRouter,
  summary: summaryRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Family management
  family: router({
    getMyFamily: protectedProcedure.query(async ({ ctx }) => {
      const family = await getFamilyByUserId(ctx.user.id);
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Family not found",
        });
      }
      return family;
    }),

    getMembers: protectedProcedure.query(async ({ ctx }) => {
      const family = await getFamilyByUserId(ctx.user.id);
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Family not found",
        });
      }
      return await getFamilyMembers(family.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await createFamily(input.name, ctx.user.id);
      }),

    addMember: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["parent", "child", "caregiver"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await addFamilyMember(family.id, input.userId, input.role);
      }),
  }),

  // Calendar management
  calendar: router({
    getEvents: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await getCalendarEvents(family.id, input.startDate, input.endDate);
      }),

    createEvent: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          startTime: z.date(),
          endTime: z.date(),
          location: z.string().optional(),
          attendees: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await createCalendarEvent({
          familyId: family.id,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          attendees: input.attendees ? JSON.stringify(input.attendees) : null,
        });
      }),
  }),

  // Tasks management
  tasks: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await getFamilyTasks(family.id, input.status);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          assignedTo: z.number().optional(),
          dueDate: z.date().optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await createTask({
          familyId: family.id,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          assignedTo: input.assignedTo,
          dueDate: input.dueDate,
          priority: input.priority || "medium",
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed"]).optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await updateTask(input.id, {
          status: input.status,
          completedAt: input.completedAt,
          updatedAt: new Date(),
        });
      }),
  }),

  // Lists management
  lists: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const family = await getFamilyByUserId(ctx.user.id);
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Family not found",
        });
      }
      return await getFamilyLists(family.id);
    }),

    getItems: protectedProcedure
      .input(z.object({ listId: z.number() }))
      .query(async ({ input }) => {
        return await getListItems(input.listId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum(["grocery", "todo", "shopping", "custom"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await createList({
          familyId: family.id,
          createdBy: ctx.user.id,
          name: input.name,
          type: input.type || "custom",
        });
      }),

    addItem: protectedProcedure
      .input(
        z.object({
          listId: z.number(),
          text: z.string(),
          quantity: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await addListItem({
          listId: input.listId,
          createdBy: ctx.user.id,
          text: input.text,
          quantity: input.quantity,
        });
      }),
  }),

  // Meal planning
  meals: router({
    getPlan: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await getMealPlans(family.id, input.date);
      }),

    addMeal: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          meal: z.string(),
          recipe: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await createMealPlan({
          familyId: family.id,
          createdBy: ctx.user.id,
          date: input.date,
          mealType: input.mealType,
          meal: input.meal,
          recipe: input.recipe,
          ingredients: input.ingredients ? JSON.stringify(input.ingredients) : null,
        });
      }),
  }),

  // AI Chat
  ai: router({
    chat: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }

        // Get recent chat history for context
        const history = await getChatHistory(family.id, 10);
        const messages = history
          .reverse()
          .map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          }));

        // Add current message
        messages.push({
          role: "user",
          content: input.message,
        });

        // Add system context
        const systemPrompt = `You are HomeBrain, an intelligent family assistant for the ${family.name} family. 
You help with calendar management, task coordination, meal planning, and family communication.
Be helpful, friendly, and concise. When users ask you to create events or tasks, confirm the details.
Current family members: ${(await getFamilyMembers(family.id)).map((m) => m.id).join(", ")}`;

        // Call LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        });

        const assistantContent = response.choices[0].message.content;
        const assistantMessage = typeof assistantContent === "string" 
          ? assistantContent 
          : "I couldn't process that request.";

        // Save messages to history
        await addChatMessage({
          familyId: family.id,
          userId: ctx.user.id,
          role: "user",
          content: input.message,
        });

        await addChatMessage({
          familyId: family.id,
          userId: ctx.user.id,
          role: "assistant",
          content: assistantMessage,
        });

        return {
          message: assistantMessage,
          timestamp: new Date(),
        };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const family = await getFamilyByUserId(ctx.user.id);
      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Family not found",
        });
      }
      return await getChatHistory(family.id, 50);
    }),
  }),

  // Notifications
  notifications: router({
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id, true);
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id, false);
    }),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["event", "task", "reminder", "summary", "suggestion"]),
          title: z.string(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const family = await getFamilyByUserId(ctx.user.id);
        if (!family) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Family not found",
          });
        }
        return await createNotification({
          familyId: family.id,
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          content: input.content,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
