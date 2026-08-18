#!/bin/bash

echo ""
echo "================================"
echo "Smart Waste System - Backend"
echo "================================"
echo ""

echo "Installing dependencies..."
cd server
npm install

echo ""
echo "Seeding database (first time only)..."
node seed.js

echo ""
echo "Starting backend server..."
node index.js
