#!/bin/bash

# Script to publish the MCP server to npm

echo "🚀 Publishing Jira MCP Server to npm..."

# Check that we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check that the user is logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Error: You are not logged in to npm. Run 'npm login' first."
    exit 1
fi

# Compile the project
echo "📦 Compiling the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Compilation failed."
    exit 1
fi

# Check that the CLI compiled correctly
if [ ! -f "dist/cli.js" ]; then
    echo "❌ Error: dist/cli.js not found. Check the compilation."
    exit 1
fi

# Make the CLI executable
chmod +x dist/cli.js

# Check the package before publishing
echo "🔍 Checking the package..."
npm pack --dry-run

# Ask for confirmation
echo ""
echo "Are you sure you want to publish jira-mcp-server@$(node -p "require('./package.json').version") to npm? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📤 Publishing to npm..."
    npm publish
    
    if [ $? -eq 0 ]; then
        echo "✅ Publication successful!"
        echo ""
        echo "🎉 Your MCP server is now available on npm!"
        echo ""
        echo "Users can use it with:"
        echo "  npx jira-mcp-server"
        echo ""
        echo "Or configure it in their MCP client with:"
        echo '  "command": "npx", "args": ["jira-mcp-server"]'
    else
        echo "❌ Error: Publication failed."
        exit 1
    fi
else
    echo "❌ Publication cancelled."
    exit 0
fi