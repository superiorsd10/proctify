-- CreateTable
CREATE TABLE "ContestLog" (
    "id" SERIAL NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioViolations" INTEGER NOT NULL DEFAULT 0,
    "noFaceViolations" INTEGER NOT NULL DEFAULT 0,
    "multipleFaceViolations" INTEGER NOT NULL DEFAULT 0,
    "keypressViolations" INTEGER NOT NULL DEFAULT 0,
    "rightClickViolations" INTEGER NOT NULL DEFAULT 0,
    "windowChangeViolations" INTEGER NOT NULL DEFAULT 0,
    "prohibitedObjectViolations" INTEGER NOT NULL DEFAULT 0,
    "ufmScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContestLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContestLog" ADD CONSTRAINT "ContestLog_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestLog" ADD CONSTRAINT "ContestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
