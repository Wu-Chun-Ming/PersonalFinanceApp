#!/bin/sh
echo "Setting up Git hooks path..."
git config core.hooksPath .githooks
echo "✅ Git hooks path set to .githooks"
git update-index --chmod=+x .githooks/pre-commit 2>/dev/null || true
echo "Git hooks ready!"