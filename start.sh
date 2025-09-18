#!/bin/sh
echo "Running Prisma DB push..."
npx prisma db push || exit 1
echo "Starting Next.js on port 3000"
npm run start
