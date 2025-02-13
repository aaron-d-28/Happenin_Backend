CREATE TABLE "booking_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(24) NOT NULL,
	"employee_id" varchar(24),
	"customer_user_id" varchar(24) NOT NULL,
	"date_booked" date NOT NULL,
	"date_visited" date,
	"time" time with time zone NOT NULL,
	"time_visited" time with time zone,
	"is_visited" boolean,
	"qr_auth" varchar(60)
);
