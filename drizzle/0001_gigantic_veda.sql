CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`location` varchar(255),
	`color` varchar(7),
	`attendees` text,
	`isRecurring` boolean DEFAULT false,
	`recurrenceRule` text,
	`externalCalendarId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `families` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` int NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#3B82F6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `families_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('parent','child','caregiver') NOT NULL DEFAULT 'child',
	`color` varchar(7) DEFAULT '#3B82F6',
	`avatar` text,
	`preferences` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`type` enum('daily','weekly','monthly') NOT NULL,
	`date` timestamp NOT NULL,
	`content` text NOT NULL,
	`highlights` text,
	`mood` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`createdBy` int NOT NULL,
	`text` varchar(500) NOT NULL,
	`quantity` varchar(100),
	`completed` boolean DEFAULT false,
	`completedBy` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('grocery','todo','shopping','custom') DEFAULT 'custom',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`createdBy` int NOT NULL,
	`date` timestamp NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`meal` varchar(255) NOT NULL,
	`recipe` text,
	`ingredients` text,
	`servings` int DEFAULT 4,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('event','task','reminder','summary','suggestion') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`relatedId` int,
	`read` boolean DEFAULT false,
	`deliveryMethod` enum('push','email','both') DEFAULT 'push',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('daily','weekly','monthly','custom') DEFAULT 'weekly',
	`schedule` text,
	`tasks` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedTo` int,
	`dueDate` timestamp,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`isRecurring` boolean DEFAULT false,
	`recurrenceRule` text,
	`points` int DEFAULT 10,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
