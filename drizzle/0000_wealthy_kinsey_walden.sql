CREATE TABLE `preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`default_level` text,
	`email_enabled` integer,
	`web_enabled` integer,
	`digest_frequency` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`user_id` text,
	`creator_id` text,
	`level` text,
	`created_at` integer,
	PRIMARY KEY(`user_id`, `creator_id`)
);
