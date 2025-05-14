"use client"

import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function VideoGrid() {
  // Responsive handling
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Animation state
  const [animationState, setAnimationState] = useState({
    verticalLines: false,
    horizontalLines: false,
    dotsInitialized: false,
    legendsInitialized: false,
    videosInitialized: false,
  })

  // Dot states
  const [dotStates, setDotStates] = useState<Record<string, { visible: boolean; white: boolean }>>({})

  // Legend states
  const [legendStates, setLegendStates] = useState<Record<string, boolean>>({})

  // Video cell states
  const [videoCellStates, setVideoCellStates] = useState<Record<string, { visible: boolean; staticColor: boolean }>>({})

  // Refs for animation tracking
  const animationRef = useRef({
    started: false,
    timers: [] as NodeJS.Timeout[],
  })

  // Define the grid structure - which cells have content
  const gridStructure = [
    // Row A - all empty
    [false, false, false, false, false, false],
    // Row B - 4 videos, 2 empty
    [true, true, true, true, false, false],
    // Row C - 4 videos, 2 empty
    [true, true, true, true, false, false],
    // Row D - 4 videos, 2 empty
    [true, true, true, true, false, false],
    // Row F - all empty
    [false, false, false, false, false, false],
  ]

  // For mobile, use a simplified grid
  const mobileGridStructure = [
    // Row B - 2 videos
    [true, true],
    // Row C - 2 videos
    [true, true],
  ]

  // Use appropriate grid based on screen size
  const activeGrid = isMobile ? mobileGridStructure : gridStructure
  const rows = activeGrid.length
  const cols = activeGrid[0].length
  const rowLabels = isMobile ? ["B", "C"] : ["A", "B", "C", "D", "F"]

  // Clear all timers
  const clearAllTimers = () => {
    animationRef.current.timers.forEach((timer) => clearTimeout(timer))
    animationRef.current.timers = []
  }

  // Shuffle array helper function
  const shuffleArray = (array: any[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Start animation sequence
  useEffect(() => {
    // Reset animation when screen size changes
    clearAllTimers()

    // Reset animation states
    setAnimationState({
      verticalLines: false,
      horizontalLines: false,
      dotsInitialized: false,
      legendsInitialized: false,
      videosInitialized: false,
    })

    // Initialize empty states
    const initialDotStates: Record<string, { visible: boolean; white: boolean }> = {}
    const initialLegendStates: Record<string, boolean> = {}
    const initialVideoCellStates: Record<string, { visible: boolean; staticColor: boolean }> = {}

    // Create dot positions
    const dotPositions: string[] = []
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const key = `${i}-${j}`
        dotPositions.push(key)
        initialDotStates[key] = { visible: false, white: false }
      }
    }

    // Create legend states
    rowLabels.forEach((label) => {
      initialLegendStates[label] = false
    })

    // Create video cell positions
    const videoCellPositions: string[] = []
    activeGrid.forEach((row, rowIndex) => {
      row.forEach((hasContent, colIndex) => {
        if (hasContent) {
          const key = `${rowIndex}-${colIndex}`
          videoCellPositions.push(key)
          initialVideoCellStates[key] = { visible: false, staticColor: false }
        }
      })
    })

    // Set initial states
    setDotStates(initialDotStates)
    setLegendStates(initialLegendStates)
    setVideoCellStates(initialVideoCellStates)

    // Shuffle arrays for random order
    const shuffledDots = shuffleArray(dotPositions)
    const shuffledVideoCells = shuffleArray(videoCellPositions)

    // Start animation sequence
    const addTimer = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay)
      animationRef.current.timers.push(timer)
      return timer
    }

    // Vertical lines
    addTimer(() => {
      setAnimationState((prev) => ({ ...prev, verticalLines: true }))
    }, 500)

    // Horizontal lines
    addTimer(() => {
      setAnimationState((prev) => ({ ...prev, horizontalLines: true }))
    }, 1500)

    // Dots animation
    shuffledDots.forEach((pos, index) => {
      // Show dot with white flash
      addTimer(
        () => {
          setDotStates((prev) => ({
            ...prev,
            [pos]: { visible: true, white: true },
          }))

          // Change color back after 100ms
          addTimer(() => {
            setDotStates((prev) => ({
              ...prev,
              [pos]: { visible: true, white: false },
            }))
          }, 100)
        },
        2500 + index * 30,
      )
    })

    // Legend animation
    const legendStartTime = 2500 + shuffledDots.length * 30 + 200
    rowLabels.forEach((label, index) => {
      addTimer(
        () => {
          setLegendStates((prev) => ({
            ...prev,
            [label]: true,
          }))
        },
        legendStartTime + index * 150,
      )
    })

    // Video cells animation
    const videoStartTime = legendStartTime + rowLabels.length * 150 + 200
    shuffledVideoCells.forEach((pos, index) => {
      // Show static color
      addTimer(
        () => {
          setVideoCellStates((prev) => ({
            ...prev,
            [pos]: { visible: true, staticColor: true },
          }))

          // Show video after 100ms
          addTimer(() => {
            setVideoCellStates((prev) => ({
              ...prev,
              [pos]: { visible: true, staticColor: false },
            }))
          }, 100)
        },
        videoStartTime + index * 100,
      )
    })

    // Cleanup function
    return () => {
      clearAllTimers()
    }
  }, [isMobile]) // Only re-run when mobile state changes

  // Generate vertical lines
  const renderVerticalLines = () => {
    const lines = []

    for (let i = 0; i <= cols; i++) {
      lines.push(
        <div
          key={`vline-${i}`}
          className={`absolute top-0 w-[1px] transform scale-x-[0.6] transition-all duration-1000 ease-in-out ${
            animationState.verticalLines ? "h-full" : "h-0"
          }`}
          style={{
            left: `${(i / cols) * 100}%`,
            backgroundColor: "#4B4B74",
          }}
        />,
      )
    }

    return lines
  }

  // Generate horizontal lines
  const renderHorizontalLines = () => {
    const lines = []

    for (let i = 0; i <= rows; i++) {
      lines.push(
        <div
          key={`hline-${i}`}
          className={`absolute left-0 h-[1px] transform scale-y-[0.6] transition-all duration-1000 ease-in-out ${
            animationState.horizontalLines ? "w-full" : "w-0"
          }`}
          style={{
            top: `${(i / rows) * 100}%`,
            backgroundColor: "#4B4B74",
          }}
        />,
      )
    }

    return lines
  }

  // Generate grid dots (intersections)
  const renderGridDots = () => {
    const dots = []
    const dotSize = "w-[6px] h-[6px]"
    const dotOffset = "-translate-x-[3px] -translate-y-[3px]"

    // We need (rows+1) * (cols+1) dots for the intersections
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const dotKey = `${i}-${j}`
        const dotState = dotStates[dotKey] || { visible: false, white: false }

        dots.push(
          <div
            key={`dot-${dotKey}`}
            className={`absolute ${dotSize} rounded-full transform ${dotOffset} transition-opacity duration-300 ${
              dotState.visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: `calc(${(i / rows) * 100}%)`,
              left: `calc(${(j / cols) * 100}%)`,
              backgroundColor: dotState.white ? "#FFFFFF" : "#0000E0",
              transition: "background-color 100ms ease-in-out, opacity 300ms ease-in-out",
            }}
          />,
        )
      }
    }

    return dots
  }

  return (
    <div className={`w-full ${isMobile ? "pl-6" : "pl-10"} relative`}>
      {/* Row labels outside the grid */}
      {rowLabels.map((label, index) => {
        const isVisible = legendStates[label] || false

        return (
          <div
            key={`label-${label}`}
            className="absolute font-mono transition-opacity duration-500"
            style={{
              left: isMobile ? "-0.75rem" : "-1.25rem",
              top: `${((index + 0.5) / rows) * 100}%`,
              transform: "translateY(-50%)",
              color: "#4B4B74",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              opacity: isVisible ? 1 : 0,
            }}
          >
            [{label}]
          </div>
        )
      })}

      {/* Grid container with fixed aspect ratio based on grid dimensions */}
      <div
        className="relative w-full"
        style={{
          height: "90vh",
          maxWidth: `calc(90vh * ${cols / rows})`, // Maintain aspect ratio based on grid dimensions
          margin: "0 auto",
        }}
      >
        <div className="absolute inset-0">
          {/* Grid cells */}
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {activeGrid.map((row, rowIndex) =>
              row.map((hasContent, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`
                const cellState = videoCellStates[cellKey] || { visible: false, staticColor: false }

                return (
                  <div key={`cell-${cellKey}`} className="relative">
                    {/* Video content if cell has content */}
                    {hasContent && (
                      <>
                        {/* Static color overlay */}
                        {cellState.staticColor && (
                          <div className="absolute inset-1 rounded-md z-10" style={{ backgroundColor: "#00004B" }} />
                        )}

                        {/* Video */}
                        <div
                          className={`absolute inset-0 transition-opacity duration-500 ${
                            cellState.visible ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <VideoCell />
                        </div>
                      </>
                    )}
                  </div>
                )
              }),
            )}
          </div>

          {/* Grid lines - separate from borders for animation */}
          {renderVerticalLines()}
          {renderHorizontalLines()}

          {/* Grid intersection dots */}
          {renderGridDots()}
        </div>
      </div>
    </div>
  )
}

function VideoCell() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const hasAttemptedPlayRef = useRef(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          // Auto-play was prevented
          setIsPlaying(false)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Auto-play with muted to avoid browser restrictions
  useEffect(() => {
    if (videoRef.current && !hasAttemptedPlayRef.current) {
      hasAttemptedPlayRef.current = true
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {
        // Auto-play was prevented
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  return (
    <div className="w-full h-full p-1">
      <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          playsInline
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        />

        {!isPlaying && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className={`${isMobile ? "w-6 h-6" : "w-10 h-10"} text-white`} />
          </button>
        )}
      </div>
    </div>
  )
}
