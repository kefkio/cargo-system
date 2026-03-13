#!/bin/bash

# Backend cleanup
rm -rf backend/=*
rm -f backend/accounts/*.tar.gz
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -type f -name "*.log" -exec rm -f {} +

# Frontend cleanup
rm -rf frontend/node_modules
find frontend -type f -name "*.txt" -exec rm -f {} +
rm frontend/public/ebay.png.png
rm frontend/public/target.png.jpg

echo "Cleanup complete!"
