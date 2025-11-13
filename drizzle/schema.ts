import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Families table - represents a family unit
 */
export const families = mysqlTable("families", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: int("ownerId").notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3B82F6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Family = typeof families.$inferSelect;
export type InsertFamily = typeof families.$inferInsert;

/**
 * Family members - users who belong to a family
 */
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["parent", "child", "caregiver"]).default("child").notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6"),
  avatar: text("avatar"),
  preferences: text("preferences"), // JSON: voice enabled, notification settings, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

/**
 * Calendar events - shared family calendar
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  createdBy: int("createdBy").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  color: varchar("color", { length: 7 }),
  attendees: text("attendees"), // JSON array of member IDs
  isRecurring: boolean("isRecurring").default(false),
  recurrenceRule: text("recurrenceRule"), // iCalendar RRULE format
  externalCalendarId: varchar("externalCalendarId", { length: 255 }), // Google/Apple calendar ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/**
 * Tasks and chores
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  createdBy: int("createdBy").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo"),
  dueDate: timestamp("dueDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  isRecurring: boolean("isRecurring").default(false),
  recurrenceRule: text("recurrenceRule"),
  points: int("points").default(10), // For gamification
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Shared lists (grocery, to-do, etc.)
 */
export const lists = mysqlTable("lists", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  createdBy: int("createdBy").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["grocery", "todo", "shopping", "custom"]).default("custom"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type List = typeof lists.$inferSelect;
export type InsertList = typeof lists.$inferInsert;

/**
 * List items
 */
export const listItems = mysqlTable("list_items", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  createdBy: int("createdBy").notNull(),
  text: varchar("text", { length: 500 }).notNull(),
  quantity: varchar("quantity", { length: 100 }),
  completed: boolean("completed").default(false),
  completedBy: int("completedBy"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = typeof listItems.$inferInsert;

/**
 * Meal plans
 */
export const mealPlans = mysqlTable("meal_plans", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  createdBy: int("createdBy").notNull(),
  date: timestamp("date").notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  meal: varchar("meal", { length: 255 }).notNull(),
  recipe: text("recipe"),
  ingredients: text("ingredients"), // JSON array
  servings: int("servings").default(4),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

/**
 * Smart routines and patterns
 */
export const routines = mysqlTable("routines", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  createdBy: int("createdBy").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["daily", "weekly", "monthly", "custom"]).default("weekly"),
  schedule: text("schedule"), // JSON: day/time details
  tasks: text("tasks"), // JSON array of task IDs or task templates
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = typeof routines.$inferInsert;

/**
 * AI chat history and context
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON: voice input, action taken, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Family summaries and insights
 */
export const familySummaries = mysqlTable("family_summaries", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  type: mysqlEnum("type", ["daily", "weekly", "monthly"]).notNull(),
  date: timestamp("date").notNull(),
  content: text("content").notNull(),
  highlights: text("highlights"), // JSON array
  mood: varchar("mood", { length: 50 }), // calm, busy, exciting, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FamilySummary = typeof familySummaries.$inferSelect;
export type InsertFamilySummary = typeof familySummaries.$inferInsert;

/**
 * Notifications and reminders
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  familyId: int("familyId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["event", "task", "reminder", "summary", "suggestion"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedId: int("relatedId"), // ID of related event/task
  read: boolean("read").default(false),
  deliveryMethod: mysqlEnum("deliveryMethod", ["push", "email", "both"]).default("push"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;