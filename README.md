# AV Tools Documentation

## Overview

The AV Tools platform provides a collection of tools and calculators for audio-visual professionals. This documentation explains how the tools system works and provides a step-by-step guide on adding new tools to the application.

## Table of Contents

- [System Architecture](#system-architecture)
- [Tool Types](#tool-types)
- [Adding a New Tool](#adding-a-new-tool)
  - [Step 1: Define Tool in tools.json](#step-1-define-tool-in-toolsjson)
  - [Step 2: Create Tool Component](#step-2-create-tool-component)
  - [Step 3: Test and Verify](#step-3-test-and-verify)
- [Premium Tools System](#premium-tools-system)
- [Tool Access Control](#tool-access-control)
- [Best Practices](#best-practices)

## System Architecture

The AV Tools platform follows a modular architecture:

- `data/tools.json`: Central registry that defines all available tools with their metadata
- `lib/tools.ts`: TypeScript interfaces and utility functions for working with tools
- `app/tools/page.tsx`: Main tools page that displays the tool catalog
- `app/tools/[id]/page.tsx`: Dynamic page that loads and renders individual tools
- `components/toolbox/`: Directory containing the implementation of each tool
- `components/toolbox/registry.ts`: Registry that maps tool IDs to their components

## Tool Types

The platform supports different types of tools:

1. **Free Tools**: Available to all users without any points requirement
2. **Point-Based Tools**: Regular tools that require unlocking with points
3. **Premium Tools**: Special tools that always require points to unlock

## Adding a New Tool

### Step 1: Define Tool in tools.json

Add a new entry to `data/tools.json` with the tool's metadata:

```json
{
  "id": "your-tool-id",
  "name": "Your Tool Name",
  "description": "A brief description of what your tool does",
  "iconName": "icon-name",  // Name of a Lucide icon
  "iconColor": "#hex-color",
  "category": "category-name", // e.g., "audio", "video", "project"
  "tags": ["tag1", "tag2"],
  "isNew": true,  // Optional: highlight as new
  "version": "1.0.0",
  "lastUpdated": "YYYY-MM-DD",
  "author": "Your Name",
  "documentation": "/docs/tools/your-tool-id",
  "isPremium": false,  // Set to true for premium tools
  "pointsRequired": 0   // Points needed to unlock (0 for free tools)
}
```

### Step 2: Create Tool Component

1. Create a new folder in `components/toolbox/` with your tool's ID:

```
components/toolbox/your-tool-id/
```

2. Create an `index.tsx` file within this folder:

```tsx
// components/toolbox/your-tool-id/index.tsx
"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define any interfaces or types specific to your tool
interface YourToolProps {
  title?: string;
}

export default function YourTool({ title = "Your Tool Name" }: YourToolProps) {
  // Tool state and logic
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Tool-specific functions
  const calculateResult = () => {
    // Implement your tool's functionality here
    const calculatedResult = `Processed: ${inputValue}`;
    setResult(calculatedResult);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your tool's UI goes here */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Input Label</label>
            <Input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Enter value..." 
            />
          </div>
      
          <Button onClick={calculateResult}>Calculate</Button>
      
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium">Result:</h3>
              <p>{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

3. The tool component will be automatically discovered and registered through the dynamic import system in `components/toolbox/registry.ts` and `components/toolbox/tool-discovery.ts`.

### Step 3: Test and Verify

1. Start the development server:

```bash
npm run dev
```

2. Visit http://localhost:3000/tools to see your tool in the catalog
3. Click on your tool to navigate to its page
4. Test all the functionality to ensure it works as expected

## Premium Tools System

Premium tools use a points-based system:

- Tools with `isPremium: true` always require purchasing with points
- The `pointsRequired` property defines how many points are needed
- When a user unlocks a premium tool, it's saved in localStorage and they can access it indefinitely
- The user earns points through completing projects, participating in training, and contributing to the community

## Tool Access Control

Access control is handled through different mechanisms:

1. **Free Tools (`pointsRequired: 0`)**: Always accessible to all users
2. **Point-Based Regular Tools**: Require points to unlock, but aren't marked as premium
3. **Premium Tools**: Always require purchase with points
4. **Unlocked Tools**: Tracked in localStorage, accessible after unlocking

The main `tools/page.tsx` component handles the logic to filter and display tools based on their access level:

- Regular unlocked tools and free tools are shown in the main tools section
- Locked tools (both premium and regular with points requirements) are shown in the locked tools section
- When a user unlocks a tool, it appears in their accessible tools

## Best Practices

When creating tools, follow these best practices:

1. **Modular Components**: Keep your tool's UI and logic self-contained
2. **Error Handling**: Include proper error handling for invalid inputs
3. **Responsive Design**: Ensure your tool works well on mobile devices
4. **Descriptive Metadata**: Provide clear descriptions and relevant tags
5. **Documentation**: Add usage instructions within the tool UI
6. **Testing**: Test your tool thoroughly before publishing

By following this documentation, you can easily add new tools to the AV Tools platform by simply updating the `tools.json` file and creating a corresponding component in the `components/toolbox` directory.
