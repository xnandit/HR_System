-- Migration for attendance table
CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "checkIn" TIMESTAMP NOT NULL,
    "checkOut" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
