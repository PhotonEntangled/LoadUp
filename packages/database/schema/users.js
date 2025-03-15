import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define the enum directly in this file
const USER_ROLE_ENUM = pgEnum("user_role", ["ADMIN", "DRIVER", "CUSTOMER"]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: USER_ROLE_ENUM("role").default("CUSTOMER"),
  phone: varchar("phone", { length: 20 }),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}); 