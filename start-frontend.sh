#!/bin/bash

echo ""
echo "================================"
echo "Smart Waste System - Frontend"
echo "================================"
echo ""

echo "Installing dependencies..."
cd client
npm install

echo ""
echo "Starting frontend dev server..."
echo "Open browser: http://localhost:5173"
echo ""
npm run dev
