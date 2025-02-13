// src/models/schema.js
import { pgTableCreator, serial, varchar, date, time, boolean } from "drizzle-orm/pg-core";

// Create `pgTable` using pgTableCreator
const pgTable = pgTableCreator((name) => name); // Generates the correct pgTable function

// Define the booking_records schema
export const bookingRecords = pgTable("booking_records", {
    id: serial("id").primaryKey(),
    eventId: varchar("event_id", { length: 24 }).notNull(),
    employeeId: varchar("employee_id", { length: 24 }),
    customerUserId: varchar("customer_user_id", { length: 24 }).notNull(),
    date_booked: date("date_booked").notNull(),
    date_to_visit: date("date_to_visit"),
    time_booked: time("time_booked", { withTimezone: true }).notNull(),//note should be controlled by user
    time_visited: time("time_visited", { withTimezone: true }),//note should be controlled by employee
    isVisited: boolean("is_visited"),
    qrAuth: varchar("qr_auth", { length: 60 }),
});
