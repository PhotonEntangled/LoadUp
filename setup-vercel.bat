@echo off
echo Loading environment variables from .env file...
call npm install dotenv --no-save
node -r dotenv/config scripts/vercel-setup.js
