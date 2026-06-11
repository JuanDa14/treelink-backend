#!/bin/sh
set -e

cp .githooks/prepare-commit-msg .git/hooks/prepare-commit-msg
chmod +x .git/hooks/prepare-commit-msg

echo "Git hooks instalados: prepare-commit-msg"
