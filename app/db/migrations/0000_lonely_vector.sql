CREATE TABLE "batches" (
	"batch_id" bigint PRIMARY KEY NOT NULL,
	"farmer_wallet" text NOT NULL,
	"crop" text NOT NULL,
	"quantity_kg" numeric(18, 0) NOT NULL,
	"geohash" text NOT NULL,
	"ipfs_photo_hash" text NOT NULL,
	"status" text DEFAULT 'REGISTERED' NOT NULL,
	"quality_grade" integer,
	"registered_at" timestamp with time zone NOT NULL,
	"last_block_number" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrows" (
	"batch_id" bigint PRIMARY KEY NOT NULL,
	"buyer_wallet" text NOT NULL,
	"snapshot_price" numeric(30, 0) NOT NULL,
	"deposit_amount" numeric(30, 0) NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"timeout_seconds" bigint NOT NULL,
	"settled" boolean DEFAULT false NOT NULL,
	"refunded" boolean DEFAULT false NOT NULL,
	"disputed" boolean DEFAULT false NOT NULL,
	"farmer_payout" numeric(30, 0),
	"buyer_refund" numeric(30, 0),
	"last_block_number" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"wallet_address" text PRIMARY KEY NOT NULL,
	"name" text,
	"phone" text,
	"custodial_key_encrypted" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indexer_cursor" (
	"contract_name" text PRIMARY KEY NOT NULL,
	"last_indexed_block" bigint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"block_number" bigint NOT NULL,
	"log_index" integer NOT NULL,
	"crop" text NOT NULL,
	"price_per_kg" numeric(30, 0) NOT NULL,
	"source_uri" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	CONSTRAINT "price_history_block_number_log_index_pk" PRIMARY KEY("block_number","log_index")
);
--> statement-breakpoint
CREATE TABLE "raw_events" (
	"block_number" bigint NOT NULL,
	"log_index" integer NOT NULL,
	"tx_hash" text NOT NULL,
	"contract_name" text NOT NULL,
	"event_name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raw_events_block_number_log_index_pk" PRIMARY KEY("block_number","log_index")
);
--> statement-breakpoint
CREATE TABLE "weighbridge_readings" (
	"batch_id" bigint PRIMARY KEY NOT NULL,
	"weight_kg" numeric(18, 0) NOT NULL,
	"device_address" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"last_block_number" bigint NOT NULL
);
