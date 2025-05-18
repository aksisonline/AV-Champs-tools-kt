import dynamic from 'next/dynamic'
import React from 'react'
import toolsData from '@/data/tools.json'

interface ToolInfo {
  id: string
  name: string
  description?: string
}

// Get tools from JSON file
const AVAILABLE_TOOLS: ToolInfo[] = toolsData.tools.map(tool => ({
  id: tool.id,
  name: tool.name,
  description: tool.description
}))

/**
 * Gets all available tools from the JSON file
 * @returns Array of tool information
 */
export function discoverTools(): ToolInfo[] {
  return AVAILABLE_TOOLS
}

/**
 * Creates a dynamic import for a tool component
 * @param toolId The tool's directory name
 * @returns Dynamic import configuration
 */
export function createToolComponent(toolId: string) {
  return dynamic(() => import(`@/components/toolbox/${toolId}`), {
    ssr: false,
    loading: () => React.createElement('div', 
      { className: 'p-8 text-center' },
      'Loading ' + toolId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') + '...'
    ),
  })
} 