-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONOR', 'SEEKER', 'VERIFIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DeviceCategory" AS ENUM ('WHEELCHAIR', 'HEARING_AID', 'CRUTCH', 'TRICYCLE', 'BRAILLE_KIT', 'PROSTHETIC');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('AVAILABLE', 'CERTIFYING', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'RE_LISTED');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('PENDING', 'SAFE', 'NOT_SAFE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PLANNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DONOR',
    "language" TEXT NOT NULL DEFAULT 'en',
    "disability_type" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_types" (
    "id" SERIAL NOT NULL,
    "category" "DeviceCategory" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "device_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "serial" TEXT NOT NULL,
    "donor_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "description" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "DeviceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "listed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "geometry" geometry(Point,4326),
    "description_tsv" tsvector,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "needs" (
    "id" SERIAL NOT NULL,
    "seeker_id" INTEGER NOT NULL,
    "category" "DeviceCategory" NOT NULL,
    "urgency_hours" INTEGER NOT NULL DEFAULT 168,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "monthly_income" INTEGER,
    "status" "DeviceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "geometry" geometry(Point,4326),

    CONSTRAINT "needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "verifier_id" INTEGER NOT NULL,
    "verdict" "Verdict" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "certificate_ref" TEXT,
    "inspected_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "need_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'GEO_SCORE',
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "pickup_addr" TEXT NOT NULL,
    "dropoff_addr" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PLANNED',
    "cost_paisa" INTEGER,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "transfer_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "re_list_intent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "actor_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "mobile" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_approved_idx" ON "users"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "device_types_category_key" ON "device_types"("category");

-- CreateIndex
CREATE UNIQUE INDEX "device_types_label_key" ON "device_types"("label");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_key" ON "devices"("serial");

-- CreateIndex
CREATE INDEX "devices_type_id_idx" ON "devices"("type_id");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "devices_donor_id_idx" ON "devices"("donor_id");

-- CreateIndex
CREATE INDEX "needs_category_idx" ON "needs"("category");

-- CreateIndex
CREATE INDEX "needs_status_idx" ON "needs"("status");

-- CreateIndex
CREATE INDEX "needs_seeker_id_idx" ON "needs"("seeker_id");

-- CreateIndex
CREATE INDEX "certifications_device_id_idx" ON "certifications"("device_id");

-- CreateIndex
CREATE INDEX "certifications_verifier_id_idx" ON "certifications"("verifier_id");

-- CreateIndex
CREATE INDEX "matches_need_id_idx" ON "matches"("need_id");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "matches_device_id_need_id_key" ON "matches"("device_id", "need_id");

-- CreateIndex
CREATE INDEX "transfers_match_id_idx" ON "transfers"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_transfer_id_key" ON "feedback"("transfer_id");

-- CreateIndex
CREATE INDEX "audit_log_table_name_record_id_idx" ON "audit_log"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "otps_mobile_idx" ON "otps"("mobile");

-- CreateIndex
CREATE INDEX "notifications_user_id_seen_idx" ON "notifications"("user_id", "seen");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "device_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "needs" ADD CONSTRAINT "needs_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_need_id_fkey" FOREIGN KEY ("need_id") REFERENCES "needs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
