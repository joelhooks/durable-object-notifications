import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema/schema.ts",
	dialect: "sqlite",
	driver: "durable-sqlite",
});