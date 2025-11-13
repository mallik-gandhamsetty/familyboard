import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  families,
  familyMembers,
  calendarEvents,
  tasks,
  lists,
  listItems,
  mealPlans,
  chatMessages,
  notifications,
  InsertFamily,
  InsertFamilyMember,
  InsertCalendarEvent,
  InsertTask,
  InsertList,
  InsertListItem,
  InsertMealPlan,
  InsertChatMessage,
  InsertNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Family queries
export async function getFamilyByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(families)
    .innerJoin(familyMembers, eq(families.id, familyMembers.familyId))
    .where(eq(familyMembers.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0].families : undefined;
}

export async function getFamilyMembers(familyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.familyId, familyId));
}

export async function createFamily(name: string, ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(families).values({
    name,
    ownerId,
  });
  
  return result;
}

export async function addFamilyMember(
  familyId: number,
  userId: number,
  role: "parent" | "child" | "caregiver"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(familyMembers).values({
    familyId,
    userId,
    role,
  });
}

// Calendar queries
export async function getCalendarEvents(familyId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.familyId, familyId),
        gte(calendarEvents.startTime, startDate),
        lte(calendarEvents.startTime, endDate)
      )
    );
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(calendarEvents).values(data);
}

// Task queries
export async function getFamilyTasks(familyId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(tasks).where(eq(tasks.familyId, familyId));
  
  if (status) {
    query = db.select().from(tasks).where(
      and(
        eq(tasks.familyId, familyId),
        eq(tasks.status, status as any)
      )
    );
  }
  
  return await query;
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(tasks).values(data);
}

export async function updateTask(taskId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}

// List queries
export async function getFamilyLists(familyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(lists).where(eq(lists.familyId, familyId));
}

export async function getListItems(listId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(listItems).where(eq(listItems.listId, listId));
}

export async function createList(data: InsertList) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(lists).values(data);
}

export async function addListItem(data: InsertListItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(listItems).values(data);
}

// Meal plan queries
export async function getMealPlans(familyId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.familyId, familyId),
        gte(mealPlans.date, startOfDay),
        lte(mealPlans.date, endOfDay)
      )
    );
}

export async function createMealPlan(data: InsertMealPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(mealPlans).values(data);
}

// Chat queries
export async function getChatHistory(familyId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.familyId, familyId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

export async function addChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(chatMessages).values(data);
}

// Notification queries
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(notifications).where(eq(notifications.userId, userId));
  
  if (unreadOnly) {
    query = db.select().from(notifications).where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      )
    );
  }
  
  return await query.orderBy(desc(notifications.createdAt));
}
