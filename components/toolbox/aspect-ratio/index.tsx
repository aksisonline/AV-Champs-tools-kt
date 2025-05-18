"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Unlock, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import FeedbackPopup from "@/components/feedback-popup"

// Common aspect ratios
const COMMON_RATIOS = [
  { name: "16:9 (HD/UHD)", value: 16 / 9 },
  { name: "4:3 (Standard)", value: 4 / 3 },
  { name: "21:9 (Ultrawide)", value: 21 / 9 },
  { name: "1:1 (Square)", value: 1 },
  { name: "2.35:1 (Cinemascope)", value: 2.35 },
  { name: "3:2 (35mm Film)", value: 3 / 2 },
  { name: "5:4 (Early Monitors)", value: 5 / 4 },
]

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState(1080)
  const [height, setHeight] = useState(1920)
  const [locked, setLocked] = useState(true)
  const [selectedRatio, setSelectedRatio] = useState("Custom")
  const [currentRatio, setCurrentRatio] = useState(9 / 16)
  const [showFeedback, setShowFeedback] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Use refs to track which dimension was updated by the user
  const isUpdatingWidth = useRef(false)
  const isUpdatingHeight = useRef(false)
  const isUpdatingRatio = useRef(false)

  // Handle ratio selection
  useEffect(() => {
    if (isUpdatingRatio.current) return

    const ratio = COMMON_RATIOS.find((r) => r.name === selectedRatio)
    if (ratio) {
      isUpdatingRatio.current = true
      setCurrentRatio(ratio.value)

      // Only update height based on width when ratio changes
      if (locked) {
        setHeight(Math.round(width / ratio.value))
      }

      isUpdatingRatio.current = false
    }
  }, [selectedRatio, width, locked])

  // Handle dimension changes
  useEffect(() => {
    // Skip if we're already processing an update
    if (isUpdatingWidth.current || isUpdatingHeight.current || isUpdatingRatio.current) return

    if (locked) {
      if (isUpdatingWidth.current) {
        // Width was updated by user, calculate height
        isUpdatingHeight.current = true
        setHeight(Math.round(width / currentRatio))
        isUpdatingHeight.current = false
      } else if (isUpdatingHeight.current) {
        // Height was updated by user, calculate width
        isUpdatingWidth.current = true
        setWidth(Math.round(height * currentRatio))
        isUpdatingWidth.current = false
      }
    } else if (width > 0 && height > 0) {
      // Not locked, calculate the current ratio
      const ratio = width / height
      setCurrentRatio(ratio)

      // Find if this matches a common ratio
      const matchedRatio = COMMON_RATIOS.find((r) => Math.abs(r.value - ratio) < 0.01)
      if (matchedRatio && matchedRatio.name !== selectedRatio) {
        isUpdatingRatio.current = true
        setSelectedRatio(matchedRatio.name)
        isUpdatingRatio.current = false
      } else if (!matchedRatio && selectedRatio !== "Custom") {
        isUpdatingRatio.current = true
        setSelectedRatio("Custom")
        isUpdatingRatio.current = false
      }
    }
  }, [width, height, locked, currentRatio, selectedRatio])

  // Handle width input change
  const handleWidthChange = (newWidth: number) => {
    isUpdatingWidth.current = true
    setWidth(newWidth)
    setHasInteracted(true)

    if (locked) {
      setHeight(Math.round(newWidth / currentRatio))
    }

    isUpdatingWidth.current = false

    // Show feedback popup after some interaction
    if (hasInteracted && !showFeedback) {
      setTimeout(() => {
        setShowFeedback(true)
      }, 3000)
    }
  }

  // Handle height input change
  const handleHeightChange = (newHeight: number) => {
    isUpdatingHeight.current = true
    setHeight(newHeight)
    setHasInteracted(true)

    if (locked) {
      setWidth(Math.round(newHeight * currentRatio))
    }

    isUpdatingHeight.current = false

    // Show feedback popup after some interaction
    if (hasInteracted && !showFeedback) {
      setTimeout(() => {
        setShowFeedback(true)
      }, 3000)
    }
  }

  // Format ratio as string (e.g., "16:9")
  const formatRatio = (ratio: number) => {
    // Check if it's a common ratio
    const matchedRatio = COMMON_RATIOS.find((r) => Math.abs(r.value - ratio) < 0.01)
    if (matchedRatio) {
      return matchedRatio.name.split(" ")[0]
    }

    // Try to find a simple fraction
    for (let denominator = 1; denominator <= 100; denominator++) {
      const numerator = Math.round(ratio * denominator)
      if (Math.abs(ratio - numerator / denominator) < 0.01) {
        return `${numerator}:${denominator}`
      }
    }

    // Return decimal if no simple fraction found
    return ratio.toFixed(2) + ":1"
  }

  // Handle preset ratio selection
  const handleRatioChange = (value: string) => {
    isUpdatingRatio.current = true
    setSelectedRatio(value)
    setHasInteracted(true)

    const ratio = COMMON_RATIOS.find((r) => r.name === value)
    if (ratio) {
      setCurrentRatio(ratio.value)

      if (locked) {
        setHeight(Math.round(width / ratio.value))
      }
    }

    isUpdatingRatio.current = false

    // Show feedback popup after some interaction
    if (hasInteracted && !showFeedback) {
      setTimeout(() => {
        setShowFeedback(true)
      }, 3000)
    }
  }

  // Handle resolution preset selection
  const handleResolutionSelect = (newWidth: number, newHeight: number) => {
    isUpdatingWidth.current = true
    isUpdatingHeight.current = true
    setHasInteracted(true)

    setWidth(newWidth)
    setHeight(newHeight)

    if (!locked) {
      const ratio = newWidth / newHeight
      setCurrentRatio(ratio)

      const matchedRatio = COMMON_RATIOS.find((r) => Math.abs(r.value - ratio) < 0.01)
      if (matchedRatio) {
        setSelectedRatio(matchedRatio.name)
      } else {
        setSelectedRatio("Custom")
      }
    }

    isUpdatingWidth.current = false
    isUpdatingHeight.current = false

    // Show feedback popup after some interaction
    if (hasInteracted && !showFeedback) {
      setTimeout(() => {
        setShowFeedback(true)
      }, 3000)
    }
  }

  const handleDownloadPDF = () => {
    // Create content for the PDF
    const content: import("@/lib/pdf-generator").PDFContentItem[] = [
      { type: "heading", content: "Aspect Ratio Calculator Results" },
      { type: "spacer" },
      {
        type: "paragraph",
        content: "This report shows the aspect ratio calculation results based on the provided dimensions.",
      },
      { type: "spacer" },
      { type: "subheading", content: "Dimensions and Ratio" },
      {
        type: "table",
        content: {
          header: ["Parameter", "Value"],
          body: [
            ["Width", `${width} pixels`],
            ["Height", `${height} pixels`],
            ["Aspect Ratio", formatRatio(currentRatio)],
            ["Decimal Ratio", currentRatio.toFixed(3)],
            ["Ratio Locked", locked ? "Yes" : "No"],
          ],
        },
      },
      { type: "spacer" },
      { type: "subheading", content: "Common Equivalent Resolutions" },
    ]

    // Add common resolutions with the same aspect ratio
    const commonResolutions = []
    if (Math.abs(currentRatio - 16 / 9) < 0.01) {
      commonResolutions.push(["HD (720p)", "1280 × 720"])
      commonResolutions.push(["Full HD (1080p)", "1920 × 1080"])
      commonResolutions.push(["4K UHD", "3840 × 2160"])
    } else if (Math.abs(currentRatio - 4 / 3) < 0.01) {
      commonResolutions.push(["VGA", "640 × 480"])
      commonResolutions.push(["SVGA", "800 × 600"])
      commonResolutions.push(["XGA", "1024 × 768"])
    } else if (Math.abs(currentRatio - 21 / 9) < 0.01) {
      commonResolutions.push(["Ultrawide HD", "2560 × 1080"])
      commonResolutions.push(["Ultrawide QHD", "3440 × 1440"])
    }

    if (commonResolutions.length > 0) {
      content.push({
        type: "table",
        content: {
          header: ["Resolution Name", "Dimensions"],
          body: commonResolutions,
        },
      } as import("@/lib/pdf-generator").PDFContentItem)
    } else {
      content.push({
        type: "paragraph",
        content: "No common resolutions match this exact aspect ratio.",
      } as import("@/lib/pdf-generator").PDFContentItem)
    }

    content.push({ type: "spacer" } as import("@/lib/pdf-generator").PDFContentItem)
    content.push({
      type: "paragraph",
      content:
        "Note: This calculation is based on pixel dimensions. Physical display sizes may vary depending on the pixel density of the display.",
    } as import("@/lib/pdf-generator").PDFContentItem)

    generatePDF("Aspect Ratio Calculator Results", content, "avchamps-aspect-ratio-result.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aspect Ratio Calculator</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Calculate and convert between different aspect ratios for displays and content
        </p>
      </div>

      <Card className="overflow-visible">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-ratio">Common Aspect Ratios</Label>
                <Select
                  value={selectedRatio}
                  onValueChange={handleRatioChange}
                >
                  <SelectTrigger id="preset-ratio" className="relative z-50">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_RATIOS.map((ratio) => (
                      <SelectItem key={ratio.name} value={ratio.name}>
                        {ratio.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-avblue-600 dark:text-avblue-400">
                    {formatRatio(currentRatio)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current Aspect Ratio</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setLocked(!locked)} className="flex items-center gap-2">
                  {locked ? (
                    <>
                      <Lock className="h-4 w-4" /> Ratio Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" /> Ratio Unlocked
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleDownloadPDF}
                  disabled={!hasInteracted}
                >
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (pixels)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (pixels)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="pt-4">
                <div
                  className="relative mx-auto border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "150px",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {width > 0 && height > 0 && (
                      <div
                        className="bg-avblue-500/20 border border-avblue-500"
                        style={{
                          width: width >= height ? "60%" : `${(width / height) * 80}%`,
                          height: height >= width ? "80%" : `${(height / width) * 80}%`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      ></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common Resolutions</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "HD (720p)", width: 1280, height: 720 },
              { name: "Full HD (1080p)", width: 1920, height: 1080 },
              { name: "2K", width: 2048, height: 1080 },
              { name: "4K UHD", width: 3840, height: 2160 },
              { name: "8K UHD", width: 7680, height: 4320 },
              { name: "SD (480p)", width: 720, height: 480 },
              { name: "XGA", width: 1024, height: 768 },
              { name: "WUXGA", width: 1920, height: 1200 },
            ].map((resolution) => (
              <Button
                key={resolution.name}
                variant="outline"
                className="h-auto py-2 justify-start"
                onClick={() => handleResolutionSelect(resolution.width, resolution.height)}
              >
                <div className="text-left">
                  <div className="font-medium">{resolution.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {resolution.width} × {resolution.height}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showFeedback && (
        <FeedbackPopup
          toolId="aspect-ratio"
          toolName="Aspect Ratio Calculator"
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}
