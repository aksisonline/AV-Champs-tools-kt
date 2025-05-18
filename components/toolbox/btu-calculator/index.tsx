/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import FeedbackPopup from "@/components/feedback-popup"

export default function BtuCalculator() {
  const [equipmentWattage, setEquipmentWattage] = useState(1000)
  const [roomSize, setRoomSize] = useState(200)
  const [occupants, setOccupants] = useState(2)
  const [windows, setWindows] = useState(2)
  const [result, setResult] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const calculateBTU = () => {
    // Basic BTU calculation formula
    // Equipment heat: 1 watt = 3.412 BTU/hr
    const equipmentHeat = equipmentWattage * 3.412

    // Room size: 20 BTU per sq ft
    const roomHeat = roomSize * 20

    // Occupants: 600 BTU per person
    const occupantHeat = occupants * 600

    // Windows: 1000 BTU per window
    const windowHeat = windows * 1000

    // Total BTU needed
    const totalBTU = equipmentHeat + roomHeat + occupantHeat + windowHeat

    setResult(Math.round(totalBTU))
    setHasInteracted(true)

    // Scroll to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    // Show feedback popup after 3 seconds
    setTimeout(() => {
      setShowFeedback(true)
    }, 3000)
  }

  const handleDownloadPDF = () => {
    if (result === null) return

    const content: {
      type: "heading" | "subheading" | "paragraph" | "list" | "table" | "spacer"
      content?: string | string[] | { header: string[]; body: string[][] }
      style?: any
    }[] = [
      { type: "heading", content: "BTU Calculator Results" },
      { type: "spacer" },
      {
        type: "paragraph",
        content:
          "This report shows the estimated cooling capacity needed for your AV equipment room based on the provided inputs.",
      },
      { type: "spacer" },
      { type: "subheading", content: "Input Parameters" },
      {
        type: "table",
        content: {
          header: ["Parameter", "Value", "Unit"],
          body: [
            ["Equipment Wattage", equipmentWattage.toString(), "Watts"],
            ["Room Size", roomSize.toString(), "sq ft"],
            ["Number of Occupants", occupants.toString(), "people"],
            ["Number of Windows", windows.toString(), "windows"],
          ],
        },
      },
      { type: "spacer" },
      { type: "subheading", content: "Calculation Breakdown" },
      {
        type: "table",
        content: {
          header: ["Component", "Calculation", "BTU/hr"],
          body: [
            ["Equipment Heat", `${equipmentWattage} W × 3.412`, Math.round(equipmentWattage * 3.412).toLocaleString()],
            ["Room Heat", `${roomSize} sq ft × 20`, Math.round(roomSize * 20).toLocaleString()],
            ["Occupant Heat", `${occupants} people × 600`, Math.round(occupants * 600).toLocaleString()],
            ["Window Heat", `${windows} windows × 1000`, Math.round(windows * 1000).toLocaleString()],
          ],
        },
      },
      { type: "spacer" },
      { type: "subheading", content: "Total Cooling Requirement" },
      { type: "paragraph", content: `The total cooling capacity required is ${result.toLocaleString()} BTU/hr.` },
      { type: "spacer" },
      {
        type: "paragraph",
        content:
          "Note: This is an estimate based on general guidelines. For precise cooling requirements, please consult with an HVAC professional.",
      },
    ]

    generatePDF("BTU Calculator Results", content, "avchamps-btu-calculator-result.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">BTU Calculator</h2>
        <p className="text-gray-600 dark:text-gray-300">Calculate cooling requirements for your AV equipment room</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="basic">Basic Mode</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment-wattage">Equipment Wattage (W)</Label>
                <Input
                  id="equipment-wattage"
                  type="number"
                  value={equipmentWattage}
                  onChange={(e) => setEquipmentWattage(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-size">Room Size (sq ft)</Label>
                <Input
                  id="room-size"
                  type="number"
                  value={roomSize}
                  onChange={(e) => setRoomSize(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="occupants">Number of Occupants</Label>
                <Input
                  id="occupants"
                  type="number"
                  value={occupants}
                  onChange={(e) => setOccupants(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="windows">Number of Windows</Label>
                <Input
                  id="windows"
                  type="number"
                  value={windows}
                  onChange={(e) => setWindows(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={calculateBTU} className="px-8">
              Calculate BTU
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Equipment Wattage: {equipmentWattage}W</Label>
                <Slider
                  value={[equipmentWattage]}
                  onValueChange={(value) => setEquipmentWattage(value[0])}
                  min={0}
                  max={5000}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Room Size: {roomSize} sq ft</Label>
                <Slider
                  value={[roomSize]}
                  onValueChange={(value) => setRoomSize(value[0])}
                  min={50}
                  max={1000}
                  step={10}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Occupants: {occupants}</Label>
                <Slider
                  value={[occupants]}
                  onValueChange={(value) => setOccupants(value[0])}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Windows: {windows}</Label>
                <Slider value={[windows]} onValueChange={(value) => setWindows(value[0])} min={0} max={10} step={1} />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={calculateBTU} className="px-8">
              Calculate BTU
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {result !== null && (
        <Card
          className="mt-8 bg-avblue-50 dark:bg-avblue-900/20 border-avblue-200 dark:border-avblue-800"
          ref={resultRef}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Calculation Result</h3>
              <div className="text-3xl font-bold text-avblue-600 dark:text-avblue-400">
                {result.toLocaleString()} BTU/hr
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                This is the estimated cooling capacity needed for your AV equipment room.
              </p>

              <Button variant="outline" className="mt-6 flex items-center gap-2" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showFeedback && (
        <FeedbackPopup toolId="btu-calculator" toolName="BTU Calculator" onClose={() => setShowFeedback(false)} />
      )}
    </div>
  )
}
