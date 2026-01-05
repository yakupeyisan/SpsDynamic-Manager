#!/bin/bash

# Build the package
echo "Building package..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Aborting publish."
  exit 1
fi

# Check if user is logged in to npm
echo "Checking npm login status..."
npm whoami

if [ $? -ne 0 ]; then
  echo "Not logged in to npm. Please run 'npm login' first."
  exit 1
fi

# Publish to npm
echo "Publishing to npm..."
npm publish --access public

if [ $? -eq 0 ]; then
  echo "✅ Package published successfully!"
else
  echo "❌ Publishing failed."
  exit 1
fi
