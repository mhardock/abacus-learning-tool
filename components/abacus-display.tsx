"use client"

import type React from "react"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

interface AbacusDisplayProps {
  onValueChange: (value: number) => void
  onCheckAnswer?: () => void
}

interface AbacusDisplayRef {
  resetAbacus: () => void
}

const AbacusDisplay = forwardRef<AbacusDisplayRef, AbacusDisplayProps>(({ onValueChange, onCheckAnswer }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [abacus, setAbacus] = useState<Abacus | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 })

  // Constants for drawing the abacus
  const DISTANCE_RODS = 60
  const TOP_MARGIN = 60
  const NUMBER_HEIGHT = 20
  const LEFT_MARGIN = 10
  const FRAME_LINE_WIDTH = 10
  const ROD_STROKE_STYLE = "rgba(212,85,0,0.5)"
  const ROD_LINE_WIDTH = 6
  const DOT_STROKE_STYLE = "rgba(0, 0, 0, 1)"
  const DOT_FILL_STYLE = "rgba(255, 255, 255, 1)"
  const DOT_SIZE = 3
  const BEAD_WIDTH = 56
  const BEAD_HEIGHT = 30
  const BEAD_STROKE = "black"
  const HEAVEN = BEAD_HEIGHT * 2 + FRAME_LINE_WIDTH
  const EARTH = BEAD_HEIGHT * 5
  const HEIGHT = HEAVEN + EARTH + FRAME_LINE_WIDTH
  const FRAME_COLOR = "black"
  const BEAD_COLOR = "#A0522D" // Light brown color for beads
  const ACTIVE_COLOR = "#8B4513" // Darker brown for active beads

  // Classes for the abacus
  class Point {
    constructor(
      public x: number,
      public y: number,
    ) {}
  }

  class Bead {
    constructor(
      public rod: Rod,
      public heaven: boolean,
      public order: number,
      public active: boolean,
    ) {}

    getPoints(): Point[] {
      const points: Point[] = []
      const center = this.evalPosition()

      points.push(new Point(center.x - BEAD_WIDTH / 2, center.y))
      points.push(new Point(center.x + BEAD_WIDTH / 2, center.y))
      points.push(new Point(center.x + BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2))
      points.push(new Point(center.x - BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2))
      points.push(new Point(center.x - BEAD_WIDTH / 2, center.y))
      points.push(new Point(center.x - BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2))
      points.push(new Point(center.x + BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2))
      points.push(new Point(center.x + BEAD_WIDTH / 2, center.y))

      return points
    }

    evalPosition(): Point {
      const context = canvasRef.current?.getContext("2d")
      if (!context) return new Point(0, 0)

      const top_frame = TOP_MARGIN + NUMBER_HEIGHT
      const x = LEFT_MARGIN + this.rod.position * DISTANCE_RODS
      let y: number

      if (this.heaven) {
        if (this.active) {
          y = top_frame + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2
        } else {
          y = top_frame + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2
        }
      } else {
        // earth
        if (this.active) {
          y = top_frame + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2
        } else {
          y = top_frame + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2
        }
      }

      return new Point(x, y)
    }

    createPath(context: CanvasRenderingContext2D): void {
      const points = this.getPoints()
      context.beginPath()
      context.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; ++i) {
        context.lineTo(points[i].x, points[i].y)
      }
    }

    draw(context: CanvasRenderingContext2D): void {
      context.save()
      context.shadowColor = "rgba(0,0,0,0.5)"
      context.shadowOffsetX = 3
      context.shadowOffsetY = 3
      context.shadowBlur = 8

      if (this.active) {
        context.fillStyle = ACTIVE_COLOR
      } else {
        context.fillStyle = BEAD_COLOR
      }

      if (this.rod.invisible) {
        context.globalAlpha = 0
      } else if (this.rod.disabled) {
        context.globalAlpha = 0.1
      } else {
        context.globalAlpha = 1
      }

      context.strokeStyle = BEAD_STROKE
      context.lineWidth = 1
      this.createPath(context)
      context.fill()
      context.stroke()
      context.restore()
    }

    reset(): void {
      this.active = false
    }
  }

  class Rod {
    constructor(
      public position: number,
      public beads: Bead[],
      public value = 0,
      public disabled = false,
      public invisible = false,
    ) {}

    drawBeads(context: CanvasRenderingContext2D): void {
      for (let i = 0; i < this.beads.length; i++) {
        this.beads[i].draw(context)
      }
    }

    drawRod(context: CanvasRenderingContext2D): void {
      const top_frame = TOP_MARGIN + NUMBER_HEIGHT

      context.save()
      context.strokeStyle = ROD_STROKE_STYLE
      context.lineWidth = ROD_LINE_WIDTH

      if (this.invisible) {
        context.globalAlpha = 0
      } else if (this.disabled) {
        context.globalAlpha = 0.1
      } else {
        context.globalAlpha = 1
      }

      context.shadowColor = "rgba(0,0,0,0.5)"
      context.shadowOffsetX = 3
      context.shadowOffsetY = 3
      context.shadowBlur = 8
      context.beginPath()
      context.moveTo(this.evalXPos(), top_frame)
      context.lineTo(this.evalXPos(), top_frame + HEIGHT)
      context.stroke()
      context.restore()
    }

    draw(context: CanvasRenderingContext2D): void {
      this.drawRod(context)
      this.drawBeads(context)
      this.writeValue(context)
    }

    evalXPos(): number {
      return LEFT_MARGIN + this.position * DISTANCE_RODS
    }

    reset(): void {
      for (let i = 0; i < this.beads.length; i++) {
        this.beads[i].reset()
      }
      this.value = 0
    }

    writeValue(context: CanvasRenderingContext2D): void {
      // No longer displaying values above the rods
    }
  }

  class Abacus {
    rods: Rod[] = []
    middleRod: number
    width: number

    constructor(
      public numberOfRods: number,
      public mode = "normal",
      public frameColor: string = FRAME_COLOR,
      public showNumbers = true,
      public clockMode = false,
    ) {
      for (let i = 0; i < numberOfRods; i++) {
        const beads: Bead[] = []
        const rod = new Rod(i + 1, beads, 0, false)

        for (let j = 0; j < 5; j++) {
          let bead: Bead
          if (j === 0) {
            bead = new Bead(rod, true, j, false)
          } else {
            bead = new Bead(rod, false, j, false)
          }
          beads.push(bead)
        }

        this.rods.push(rod)
      }

      this.middleRod = Math.floor(numberOfRods / 2) + 1
      this.width = DISTANCE_RODS * (numberOfRods + 1)

      if (clockMode) {
        this.hideClockUselessRods()
      }
    }

    drawFrame(context: CanvasRenderingContext2D): void {
      const frameTop = TOP_MARGIN + NUMBER_HEIGHT

      context.save()
      context.strokeStyle = this.frameColor
      context.lineWidth = FRAME_LINE_WIDTH
      context.shadowColor = "rgba(0,0,0,0.5)"
      context.shadowOffsetX = 3
      context.shadowOffsetY = 3
      context.shadowBlur = 8
      context.beginPath()
      context.rect(LEFT_MARGIN, frameTop, this.width, HEIGHT)
      context.moveTo(LEFT_MARGIN + FRAME_LINE_WIDTH / 2, frameTop + HEAVEN)
      context.lineTo(LEFT_MARGIN + this.width - FRAME_LINE_WIDTH / 2, frameTop + HEAVEN)
      context.stroke()

      const middle = Math.floor(this.numberOfRods / 2)
      context.lineWidth = 1
      context.strokeStyle = DOT_STROKE_STYLE
      context.fillStyle = DOT_FILL_STYLE

      for (let i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < this.numberOfRods; ++i, x += DISTANCE_RODS) {
        // Dot in this and this +- 3
        if ((i - middle) % 3 === 0) {
          context.beginPath()
          context.arc(x, frameTop + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false)
          context.fill()
          context.stroke()
        }
      }

      context.restore()
    }

    drawRods(context: CanvasRenderingContext2D): void {
      context.save()
      context.strokeStyle = ROD_STROKE_STYLE
      context.lineWidth = ROD_LINE_WIDTH

      for (let i = 0; i < this.numberOfRods; ++i) {
        const rod = this.rods[i]
        rod.draw(context)
      }

      context.restore()
    }

    draw(context: CanvasRenderingContext2D): void {
      context.save()
      context.clearRect(0, 0, canvasSize.width, canvasSize.height)
      this.drawRods(context)
      this.drawFrame(context)
      context.restore()
    }

    reset(): void {
      for (let i = 0; i < this.numberOfRods; i++) {
        const rod = this.rods[i]
        rod.reset()
      }
      this.showNumbers = true
    }

    hideClockUselessRods(): void {
      this.rods[this.numberOfRods - 3].invisible = true
      this.rods[this.numberOfRods - 6].invisible = true
      this.rods[this.numberOfRods - 9].invisible = true
    }

    showClockUselessRods(): void {
      this.rods[this.numberOfRods - 3].invisible = false
      this.rods[this.numberOfRods - 6].invisible = false
      this.rods[this.numberOfRods - 9].invisible = false
    }

    disableAllRods(): void {
      for (let i = 0; i < this.numberOfRods; i++) {
        const rod = this.rods[i]
        rod.disabled = true
      }
    }
  }

  // Helper function to convert window coordinates to canvas coordinates
  const windowToCanvas = (canvas: HTMLCanvasElement, x: number, y: number) => {
    const bbox = canvas.getBoundingClientRect()
    return {
      x: x - bbox.left * (canvas.width / bbox.width),
      y: y - bbox.top * (canvas.height / bbox.height),
    }
  }

  // Helper function to get a bead by its properties
  const getBead = (rod: Rod, heaven: boolean, order: number): Bead | undefined => {
    for (let i = 0; i < rod.beads.length; i++) {
      if (rod.beads[i].heaven === heaven && rod.beads[i].order === order) {
        return rod.beads[i]
      }
    }
    return undefined
  }

  // Function to handle clicking a bead
  const clickedBead = (bead: Bead) => {
    if (bead.heaven) {
      if (bead.active) {
        bead.active = false
        bead.rod.value -= 5
      } else {
        bead.active = true
        bead.rod.value += 5
      }
    } else {
      if (bead.active) {
        bead.active = false
        bead.rod.value--
        for (let i = bead.order + 1; i <= 4; i++) {
          const nextBead = getBead(bead.rod, false, i)
          if (nextBead?.active) {
            nextBead.active = false
            nextBead.rod.value--
          }
        }
      } else {
        bead.active = true
        bead.rod.value++
        for (let i = 1; i < bead.order; i++) {
          const nextBead = getBead(bead.rod, false, i)
          if (nextBead && !nextBead.active) {
            nextBead.active = true
            nextBead.rod.value++
          }
        }
      }
    }
  }

  // Calculate the total value on the abacus
  const calculateAbacusValue = (): number => {
    if (!abacus) return 0

    let total = 0
    const middleRod = Math.floor(abacus.numberOfRods / 2)

    for (let i = 0; i < abacus.numberOfRods; i++) {
      const rod = abacus.rods[i]
      const placeValue = Math.pow(10, middleRod - i)
      total += rod.value * placeValue
    }

    return total
  }

  // State for the current abacus value
  const [currentValue, setCurrentValue] = useState<number>(0)

  // Initialize the abacus
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const numberOfRods = 7
    const newAbacus = new Abacus(numberOfRods)
    setAbacus(newAbacus)
    setCanvasSize({
      width: newAbacus.width + 2 * LEFT_MARGIN,
      height: TOP_MARGIN + NUMBER_HEIGHT + HEIGHT + 10,
    })

    // Draw the abacus
    newAbacus.draw(context)
  }, [HEIGHT, TOP_MARGIN, NUMBER_HEIGHT, LEFT_MARGIN])

  // Update canvas when size changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !abacus) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    abacus.draw(context)
  }, [canvasSize, abacus])

  // Handle click events
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !abacus) return

    const context = canvas.getContext("2d")
    if (!context) return

    const loc = windowToCanvas(canvas, e.clientX, e.clientY)
    let found = false

    for (let i = 0; i < abacus.numberOfRods && !found; i++) {
      const currentRod = abacus.rods[i]
      for (let j = 0; j < currentRod.beads.length && !found; j++) {
        const currentBead = currentRod.beads[j]
        currentBead.createPath(context)
        if (context.isPointInPath(loc.x, loc.y)) {
          found = true
          // Play bead sound if we had one
          clickedBead(currentBead)
        }
      }
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    abacus.draw(context)

    // Update the current value
    const newValue = calculateAbacusValue()
    setCurrentValue(newValue)
  }

  // Reset the abacus
  const resetAbacus = () => {
    if (!abacus || !canvasRef.current) return

    const context = canvasRef.current.getContext("2d")
    if (!context) return

    abacus.reset()
    abacus.draw(context)

    // Update the current value
    setCurrentValue(0)
  }

  // Expose the resetAbacus function to parent components
  useImperativeHandle(ref, () => ({
    resetAbacus,
  }))

  // Notify parent component when value changes
  useEffect(() => {
    onValueChange(currentValue)
  }, [currentValue, onValueChange])

  return (
    <div className="w-full flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleClick}
        className="cursor-pointer mt-4"
      />
      <div className="mt-4 flex space-x-4">
        {onCheckAnswer && (
          <button
            onClick={onCheckAnswer}
            className="px-4 py-2 bg-[#8d6e63] hover:bg-[#6d4c41] text-white font-medium rounded-lg shadow-md transition-colors"
          >
            Check Answer
          </button>
        )}
        <button
          onClick={resetAbacus}
          className="px-6 py-3 bg-white hover:bg-gray-100 text-[#5d4037] font-medium rounded-lg shadow-md border border-[#8d6e63] transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
})

AbacusDisplay.displayName = "AbacusDisplay"

export default AbacusDisplay
