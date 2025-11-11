#!/bin/sh
echo "Setting up Git hooks path..."
git config core.hooksPath .githooks
echo "✅ Git hooks path set to .githooks"
echo "Git hooks ready!"