import React from "react"
import type { ComponentType } from "react"
import { discoverTools, createToolComponent } from "./tool-discovery"

// Define a type for the tool registry
type ToolRegistry = {
  [key: string]: {
    component: ComponentType
    fallback: React.ReactNode
  }
}

// Create a registry of all available tools
const toolRegistry: ToolRegistry = {}

// Automatically discover and register all tools
discoverTools().forEach(tool => {
  toolRegistry[tool.id] = {
    component: createToolComponent(tool.id),
    fallback: React.createElement('div', null, 'Loading...'),
  }
})

/**
 * Get a tool component by ID
 * @param id The tool ID
 * @returns The tool component or null if not found
 */
export function getToolComponent(id: string): ComponentType | null {
  return toolRegistry[id]?.component || null
}

/**
 * Check if a tool exists in the registry
 * @param id The tool ID
 * @returns True if the tool exists, false otherwise
 */
export function toolExists(id: string): boolean {
  return !!toolRegistry[id]
}

/**
 * Get all available tool IDs
 * @returns Array of tool IDs
 */
export function getAllToolIds(): string[] {
  return Object.keys(toolRegistry)
}
