"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import "./tools.module.css" // Import the light mode CSS
import {
  Search,
  Filter,
  Star,
  Clock,
  Wrench,
  Calculator,
  Video,
  Music,
  Calendar,
  BarChart,
  MessageSquare,
  ExternalLink,
  Lock,
  Unlock,
  Award,
  Zap,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import type { ToolMetadata } from "@/lib/tools"
import dynamic from "next/dynamic"
import { useMobile } from "@/hooks/use-mobile"
import { getUserPoints, updateUserPoints } from "@/lib/points-service"
import { toast } from "@/hooks/use-toast"

// Dynamically import icons to avoid bundling all icons
const LucideIcon = dynamic(() => import("@/components/dynamic-icon"), {
  loading: () => <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />,
  ssr: false,
})

// Tool categories
const categories = [
  { id: "all", name: "All Tools", icon: <Wrench className="h-4 w-4" /> },
  { id: "project", name: "Project Calculators", icon: <Calculator className="h-4 w-4" /> },
  { id: "video", name: "Video Tools", icon: <Video className="h-4 w-4" /> },
  { id: "audio", name: "Audio Tools", icon: <Music className="h-4 w-4" /> },
  { id: "reports", name: "Reports", icon: <BarChart className="h-4 w-4" /> },
  { id: "communications", name: "Communications", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "events", name: "Events & Training", icon: <Calendar className="h-4 w-4" /> },
  { id: "integrations", name: "Integrations", icon: <ExternalLink className="h-4 w-4" /> },
]

// Locked tools data
const lockedTools: (ToolMetadata & { pointsRequired: number; progress?: number })[] = [
  {
    id: "advanced-room-designer",
    name: "Advanced Room Designer",
    description: "Professional 3D room design tool with acoustic modeling and equipment placement",
    iconName: "layout-dashboard",
    iconColor: "#6366f1",
    category: "project",
    tags: ["design", "3D", "acoustics"],
    isNew: true,
    pointsRequired: 100,
    progress: 65,
  },
  {
    id: "signal-analyzer",
    name: "Signal Analyzer Pro",
    description: "Advanced audio signal analysis with frequency response, phase, and distortion measurements",
    iconName: "activity",
    iconColor: "#ec4899",
    category: "audio",
    tags: ["audio", "analysis", "measurement"],
    pointsRequired: 75,
    progress: 40,
  },
  {
    id: "network-simulator",
    name: "AV Network Simulator",
    description: "Simulate AV over IP networks with bandwidth analysis and latency testing",
    iconName: "network",
    iconColor: "#14b8a6",
    category: "video",
    tags: ["network", "IP", "bandwidth"],
    pointsRequired: 150,
  },
]

export default function ToolsPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [tools, setTools] = useState<ToolMetadata[]>([])
  const [filteredTools, setFilteredTools] = useState<ToolMetadata[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [unlockedTools, setUnlockedTools] = useState<string[]>([])
  const [isUnlocking, setIsUnlocking] = useState(false)
  
  // Add effect to force light mode
  useEffect(() => {
    // Add light-mode class to html element
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Clean up when component unmounts
    return () => {
      // We don't remove the light class on unmount since we want all pages to stay in light mode
    };
  }, []);

  // Fetch tools from the API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true)

        // Get user points securely
        const points = await getUserPoints()
        setUserPoints(points)

        // Get unlocked tools
        const storedUnlocked = localStorage.getItem("unlockedTools")
        if (storedUnlocked) {
          setUnlockedTools(JSON.parse(storedUnlocked))
        }

        // Get favorites
        const savedFavorites = localStorage.getItem("av-tools-favorites")
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }

        // Get recently used tools
        const savedRecent = localStorage.getItem("av-tools-recent")
        if (savedRecent) {
          setRecentlyUsed(JSON.parse(savedRecent))
        }

        // Fetch tools
        const response = await fetch("/api/tools")
        if (!response.ok) {
          throw new Error("Failed to fetch tools")
        }
        const data = await response.json()
        setTools(data)
        setFilteredTools(data)
      } catch (error) {
        console.error("Error fetching tools:", error)
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTools()
  }, [])

  // Filter tools based on search query and active category
  useEffect(() => {
    let filtered = tools

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (activeCategory !== "all") {
      filtered = filtered.filter((tool) => tool.category === activeCategory)
    }

    setFilteredTools(filtered)
  }, [searchQuery, activeCategory, tools])

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id]

    setFavorites(newFavorites)
    localStorage.setItem("av-tools-favorites", JSON.stringify(newFavorites))
  }

  // Track tool usage
  const trackToolUsage = (id: string) => {
    const newRecent = [id, ...recentlyUsed.filter((item) => item !== id)].slice(0, 5)
    setRecentlyUsed(newRecent)
    localStorage.setItem("av-tools-recent", JSON.stringify(newRecent))

    // Navigate to the tool page
    router.push(`/tools/${id}`)
  }

  // Unlock a tool
  const unlockTool = async (id: string, pointsRequired: number) => {
    setIsUnlocking(true)

    try {
      // Use the secure points service to spend points
      const success = await updateUserPoints(pointsRequired, "spend", `Unlocked premium tool: ${id}`, { toolId: id })

      if (success) {
        // Update unlocked tools list
        const newUnlocked = [...unlockedTools, id]
        setUnlockedTools(newUnlocked)
        localStorage.setItem("unlockedTools", JSON.stringify(newUnlocked))

        // Refresh user points
        const updatedPoints = await getUserPoints()
        setUserPoints(updatedPoints)

        toast({
          title: "Tool Unlocked!",
          description: `You've successfully unlocked the premium tool.`,
        })
      } else {
        toast({
          title: "Unlock Failed",
          description: "You don't have enough points to unlock this tool.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error unlocking tool:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUnlocking(false)
    }
  }

  // Get favorite tools
  const getFavoriteTools = () => {
    return tools.filter((tool) => favorites.includes(tool.id))
  }

  // Get recently used tools
  const getRecentTools = () => {
    return recentlyUsed.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as ToolMetadata[]
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4 sm:px-6 lg:px-8 light-mode-only">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AV Tools</h1>
          <p className="text-gray-600">
            Professional tools and calculators for audio-visual professionals
          </p>
        </div>

        {/* User Points Display */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Your Points</h3>
                <p className="text-sm text-gray-500">Unlock premium tools with your points</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{userPoints}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search tools..."
              className="pl-10 bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="hidden sm:inline">Favorites</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click the star on any tool to add it to favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="hidden sm:inline">Recent</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your recently used tools appear here</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-white p-1 rounded-lg border border-gray-200 flex flex-wrap justify-start gap-1">
            <TabsTrigger
              value="all"
              className="rounded-md data-[state=active]:bg-avblue-50 data-[state=active]:text-avblue-600 dark:data-[state=active]:bg-avblue-900/30 dark:data-[state=active]:text-avblue-400"
            >
              All Tools
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="rounded-md data-[state=active]:bg-avblue-50 data-[state=active]:text-avblue-600 dark:data-[state=active]:bg-avblue-900/30 dark:data-[state=active]:text-avblue-400"
            >
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-md data-[state=active]:bg-avblue-50 data-[state=active]:text-avblue-600 dark:data-[state=active]:bg-avblue-900/30 dark:data-[state=active]:text-avblue-400"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="locked"
              className="rounded-md data-[state=active]:bg-avblue-50 data-[state=active]:text-avblue-600 dark:data-[state=active]:bg-avblue-900/30 dark:data-[state=active]:text-avblue-400"
            >
              Locked ({lockedTools.length - unlockedTools.length})
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFavoriteTools().map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={true}
                    onFavoriteToggle={toggleFavorite}
                    onToolClick={trackToolUsage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Click the star icon on any tool to add it to your favorites for quick access
                </p>
              </div>
            )}
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent">
            {recentlyUsed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getRecentTools().map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favorites.includes(tool.id)}
                    onFavoriteToggle={toggleFavorite}
                    onToolClick={trackToolUsage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent tools</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Tools you use will appear here for quick access
                </p>
              </div>
            )}
          </TabsContent>

          {/* Locked Tools Tab */}
          <TabsContent value="locked">
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Premium Tools</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Unlock advanced tools by earning points through completing projects, participating in training, and
                    contributing to the community.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lockedTools
                .filter((tool) => !unlockedTools.includes(tool.id))
                .map((tool) => (
                  <LockedToolCard
                    key={tool.id}
                    tool={tool}
                    userPoints={userPoints}
                    onUnlock={unlockTool}
                    isUnlocking={isUnlocking}
                  />
                ))}
            </div>
          </TabsContent>

          {/* All Tools Tab */}
          <TabsContent value="all">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap mb-2"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span>{isMobile && category.id !== "all" ? "" : category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ToolCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {/* Regular Tools Section */}
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        isFavorite={favorites.includes(tool.id)}
                        onFavoriteToggle={toggleFavorite}
                        onToolClick={trackToolUsage}
                      />
                    ))}

                    {/* Show unlocked premium tools in the All tab */}
                    {lockedTools
                      .filter((tool) => unlockedTools.includes(tool.id))
                      .filter((tool) => activeCategory === "all" || tool.category === activeCategory)
                      .filter(
                        (tool) =>
                          !searchQuery ||
                          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                      )
                      .map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          isFavorite={favorites.includes(tool.id)}
                          onFavoriteToggle={toggleFavorite}
                          onToolClick={trackToolUsage}
                          isPremium
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}

                {/* Locked Tools Section */}
                {lockedTools
                  .filter((tool) => !unlockedTools.includes(tool.id))
                  .filter((tool) => activeCategory === "all" || tool.category === activeCategory)
                  .filter(
                    (tool) =>
                      !searchQuery ||
                      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                  ).length > 0 && (
                  <>
                    <div className="flex items-center my-8">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                      <div className="mx-4 flex items-center">
                        <Lock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Locked Tools</span>
                      </div>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {lockedTools
                        .filter((tool) => !unlockedTools.includes(tool.id))
                        .filter((tool) => activeCategory === "all" || tool.category === activeCategory)
                        .filter(
                          (tool) =>
                            !searchQuery ||
                            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                        )
                        .map((tool) => (
                          <LockedToolCard
                            key={tool.id}
                            tool={tool}
                            userPoints={userPoints}
                            onUnlock={unlockTool}
                            isUnlocking={isUnlocking}
                          />
                        ))}
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({
  tool,
  isFavorite,
  onFavoriteToggle,
  onToolClick,
  isPremium = false,
}: {
  tool: ToolMetadata
  isFavorite: boolean
  onFavoriteToggle: (id: string) => void
  onToolClick: (id: string) => void
  isPremium?: boolean
}) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden h-full bg-white hover:shadow-md transition-shadow ${isPremium ? "border-2 border-yellow-400" : ""}`}
      >
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-2 rounded-lg ${isPremium ? "bg-yellow-100" : "bg-gray-100"}`}
              >
                <LucideIcon />
              </div>
              <div className="flex items-center gap-2">
                {isPremium && <Badge className="bg-yellow-500 text-white">Premium</Badge>}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onFavoriteToggle(tool.id)
                  }}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                </button>
              </div>
            </div>

            <h3 className="font-medium text-lg text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{tool.description}</p>

            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                  {tag}
                </Badge>
              ))}
              {tool.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
              {tool.version && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-600"
                >
                  v{tool.version}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-100">
            <Button
              variant="ghost"
              className={`w-full rounded-none py-4 h-auto ${isPremium ? "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "text-avblue-600 dark:text-avblue-400 hover:bg-avblue-50 dark:hover:bg-avblue-900/20"}`}
              onClick={() => onToolClick(tool.id)}
            >
              Open Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Locked Tool Card Component
function LockedToolCard({
  tool,
  userPoints,
  onUnlock,
  isUnlocking,
}: {
  tool: ToolMetadata & { pointsRequired: number; progress?: number }
  userPoints: number
  onUnlock: (id: string, pointsRequired: number) => void
  isUnlocking: boolean
}) {
  const canUnlock = userPoints >= tool.pointsRequired

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden h-full bg-gray-100 hover:shadow-md transition-shadow relative">
        {/* Lock Overlay */}
        <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
          <div className="p-3 bg-white rounded-full shadow-lg mb-3">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <div className="text-center px-4">
            <h4 className="font-medium text-gray-900 mb-1">Required Points</h4>
            <div className="flex items-center justify-center gap-1 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xl font-bold text-yellow-600">{tool.pointsRequired}</span>
            </div>

            {tool.progress && (
              <div className="mb-3 w-full max-w-[200px] mx-auto">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{tool.progress}%</span>
                </div>
                <Progress value={tool.progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={() => onUnlock(tool.id, tool.pointsRequired)}
              disabled={!canUnlock || isUnlocking}
              className={canUnlock ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
            >
              {isUnlocking ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : canUnlock ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Now
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {userPoints > 0 ? `Need ${tool.pointsRequired - userPoints} more points` : "Earn Points to Unlock"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tool Card (Blurred Background) */}
        <CardContent className="p-0 opacity-70">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                <LucideIcon />
              </div>
              <div>
                <Badge className="bg-yellow-500/50 text-white">Premium</Badge>
              </div>
            </div>

            <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{tool.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{tool.description}</p>

            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-gray-200 dark:bg-gray-700">
                  {tag}
                </Badge>
              ))}
              {tool.isNew && <Badge className="bg-green-500/50 text-white">New</Badge>}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="w-full py-4 h-auto text-center text-gray-400">Locked</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Skeleton loader for tool cards
function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full bg-white dark:bg-gray-800">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 dark:border-gray-700">
          <Skeleton className="h-12 w-full rounded-none" />
        </div>
      </CardContent>
    </Card>
  )
}
