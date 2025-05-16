"use client"

import type React from "react"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Abacus, Rod, Bead, Point } from "@/lib/abacus"

interface AbacusDisplayProps {
  onValueChange: (value: number) => void
  onCheckAnswer?: () => void
}

interface AbacusDisplayRef {
  resetAbacus: () => void
}

// Define interfaces for dynamic methods
interface AbacusWithDraw extends Abacus {
  draw: (context: CanvasRenderingContext2D) => void;
  drawRods: (context: CanvasRenderingContext2D) => void;
  drawFrame: (context: CanvasRenderingContext2D) => void;
}
interface RodWithDraw extends Rod {
  draw: (context: CanvasRenderingContext2D) => void;
  drawRod: (context: CanvasRenderingContext2D) => void;
  drawBeads: (context: CanvasRenderingContext2D) => void;
  evalXPos: () => number;
  writeValue: (context: CanvasRenderingContext2D) => void;
}
interface BeadWithDraw extends Bead {
  draw: (context: CanvasRenderingContext2D) => void;
  createPath: (context: CanvasRenderingContext2D) => void;
}

// Helper: Attach draw and createPath methods to Abacus and Bead for display
function attachDisplayMethods(abacus: Abacus, canvasSize: { width: number; height: number }, constants: any) {
  const abacusWithDraw = abacus as AbacusWithDraw;
  abacusWithDraw.draw = function(context: CanvasRenderingContext2D) {
    context.save();
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    this.drawRods(context);
    this.drawFrame(context);
    context.restore();
  };
  abacusWithDraw.drawRods = function(context: CanvasRenderingContext2D) {
    context.save();
    context.strokeStyle = constants.ROD_STROKE_STYLE;
    context.lineWidth = constants.ROD_LINE_WIDTH;
    for (let i = 0; i < this.numberOfRods; ++i) {
      const rod = this.rods[i] as RodWithDraw;
      if (typeof rod.draw === 'function') {
        rod.draw(context);
      }
    }
    context.restore();
  };
  abacusWithDraw.drawFrame = function(context: CanvasRenderingContext2D) {
    const frameTop = constants.TOP_MARGIN + constants.NUMBER_HEIGHT;
    context.save();
    context.strokeStyle = this.frameColor;
    context.lineWidth = constants.FRAME_LINE_WIDTH;
    context.shadowColor = "rgba(0,0,0,0.5)";
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.shadowBlur = 8;
    context.beginPath();
    context.rect(constants.LEFT_MARGIN, frameTop, this.width, constants.HEIGHT);
    context.moveTo(constants.LEFT_MARGIN + constants.FRAME_LINE_WIDTH / 2, frameTop + constants.HEAVEN);
    context.lineTo(constants.LEFT_MARGIN + this.width - constants.FRAME_LINE_WIDTH / 2, frameTop + constants.HEAVEN);
    context.stroke();
    const middle = Math.floor(this.numberOfRods / 2);
    context.lineWidth = 1;
    context.strokeStyle = constants.DOT_STROKE_STYLE;
    context.fillStyle = constants.DOT_FILL_STYLE;
    for (let i = 0, x = constants.LEFT_MARGIN + constants.DISTANCE_RODS; i < this.numberOfRods; ++i, x += constants.DISTANCE_RODS) {
      if ((i - middle) % 3 === 0) {
        context.beginPath();
        context.arc(x, frameTop + constants.HEAVEN, constants.DOT_SIZE, 0, Math.PI * 2, false);
        context.fill();
        context.stroke();
      }
    }
    context.restore();
  };
  for (const rod of abacus.rods) {
    const rodWithDraw = rod as RodWithDraw;
    rodWithDraw.draw = function(context: CanvasRenderingContext2D) {
      this.drawRod(context);
      this.drawBeads(context);
      if (typeof this.writeValue === 'function') this.writeValue(context);
    };
    rodWithDraw.drawRod = function(context: CanvasRenderingContext2D) {
      const top_frame = constants.TOP_MARGIN + constants.NUMBER_HEIGHT;
      context.save();
      context.strokeStyle = constants.ROD_STROKE_STYLE;
      context.lineWidth = constants.ROD_LINE_WIDTH;
      if (this.invisible) {
        context.globalAlpha = 0;
      } else if (this.disabled) {
        context.globalAlpha = 0.1;
      } else {
        context.globalAlpha = 1;
      }
      context.shadowColor = "rgba(0,0,0,0.5)";
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowBlur = 8;
      context.beginPath();
      context.moveTo(this.evalXPos(), top_frame);
      context.lineTo(this.evalXPos(), top_frame + constants.HEIGHT);
      context.stroke();
      context.restore();
    };
    rodWithDraw.drawBeads = function(context: CanvasRenderingContext2D) {
      for (let i = 0; i < this.beads.length; i++) {
        const bead = this.beads[i] as BeadWithDraw;
        if (typeof bead.draw === 'function') {
          bead.draw(context);
        }
      }
    };
    rodWithDraw.evalXPos = function() {
      return constants.LEFT_MARGIN + this.position * constants.DISTANCE_RODS;
    };
    rodWithDraw.writeValue = function(context: CanvasRenderingContext2D) {
      void context;
    };
    for (const bead of rod.beads) {
      const beadWithDraw = bead as BeadWithDraw;
      beadWithDraw.draw = function(context: CanvasRenderingContext2D) {
        context.save();
        context.shadowColor = "rgba(0,0,0,0.5)";
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 8;
        if (this.active) {
          context.fillStyle = constants.ACTIVE_COLOR;
        } else {
          context.fillStyle = constants.BEAD_COLOR;
        }
        if (this.rod.invisible) {
          context.globalAlpha = 0;
        } else if (this.rod.disabled) {
          context.globalAlpha = 0.1;
        } else {
          context.globalAlpha = 1;
        }
        context.strokeStyle = constants.BEAD_STROKE;
        context.lineWidth = 1;
        this.createPath(context);
        context.fill();
        context.stroke();
        context.restore();
      };
      beadWithDraw.createPath = function(context: CanvasRenderingContext2D) {
        // Re-implement getPoints and evalPosition logic inline for display
        const top_frame = constants.TOP_MARGIN + constants.NUMBER_HEIGHT;
        const x = constants.LEFT_MARGIN + this.rod.position * constants.DISTANCE_RODS;
        let y;
        if (this.heaven) {
          if (this.active) {
            y = top_frame + constants.HEAVEN - constants.BEAD_HEIGHT / 2 - constants.FRAME_LINE_WIDTH / 2;
          } else {
            y = top_frame + constants.BEAD_HEIGHT / 2 + constants.FRAME_LINE_WIDTH / 2;
          }
        } else {
          if (this.active) {
            y = top_frame + constants.HEAVEN + (this.order - 1) * constants.BEAD_HEIGHT + constants.BEAD_HEIGHT / 2 + constants.FRAME_LINE_WIDTH / 2;
          } else {
            y = top_frame + constants.HEAVEN + this.order * constants.BEAD_HEIGHT + constants.BEAD_HEIGHT / 2 + constants.FRAME_LINE_WIDTH / 2;
          }
        }
        const center = new Point(x, y);
        const beadPoints = [
          new Point(center.x - constants.BEAD_WIDTH / 2, center.y),
          new Point(center.x + constants.BEAD_WIDTH / 2, center.y),
          new Point(center.x + constants.BEAD_WIDTH / 6, center.y - constants.BEAD_HEIGHT / 2),
          new Point(center.x - constants.BEAD_WIDTH / 6, center.y - constants.BEAD_HEIGHT / 2),
          new Point(center.x - constants.BEAD_WIDTH / 2, center.y),
          new Point(center.x - constants.BEAD_WIDTH / 6, center.y + constants.BEAD_HEIGHT / 2),
          new Point(center.x + constants.BEAD_WIDTH / 6, center.y + constants.BEAD_HEIGHT / 2),
          new Point(center.x + constants.BEAD_WIDTH / 2, center.y),
        ];
        context.beginPath();
        context.moveTo(beadPoints[0].x, beadPoints[0].y);
        for (let i = 1; i < beadPoints.length; ++i) {
          context.lineTo(beadPoints[i].x, beadPoints[i].y);
        }
      };
    }
  }
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
    attachDisplayMethods(newAbacus, { width: newAbacus.width + 2 * LEFT_MARGIN, height: TOP_MARGIN + NUMBER_HEIGHT + HEIGHT + 10 }, {
      DISTANCE_RODS,
      TOP_MARGIN,
      NUMBER_HEIGHT,
      LEFT_MARGIN,
      FRAME_LINE_WIDTH,
      ROD_STROKE_STYLE,
      ROD_LINE_WIDTH,
      DOT_STROKE_STYLE,
      DOT_FILL_STYLE,
      DOT_SIZE,
      BEAD_WIDTH,
      BEAD_HEIGHT,
      BEAD_STROKE,
      HEAVEN,
      EARTH,
      HEIGHT,
      FRAME_COLOR,
      BEAD_COLOR,
      ACTIVE_COLOR,
    })
    setAbacus(newAbacus)
    setCanvasSize({
      width: newAbacus.width + 2 * LEFT_MARGIN,
      height: TOP_MARGIN + NUMBER_HEIGHT + HEIGHT + 10,
    })

    // Draw the abacus
    const drawAbacus = (newAbacus as AbacusWithDraw).draw;
    if (typeof drawAbacus === 'function') {
      drawAbacus.call(newAbacus, context);
    }
  }, [HEIGHT, TOP_MARGIN, NUMBER_HEIGHT, LEFT_MARGIN, EARTH, HEAVEN])

  // Update canvas when size changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !abacus) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    const drawAbacus2 = (abacus as AbacusWithDraw).draw;
    if (typeof drawAbacus2 === 'function') {
      drawAbacus2.call(abacus, context);
    }
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
        const currentBead: BeadWithDraw = currentRod.beads[j] as BeadWithDraw;
        const createPath = currentBead.createPath;
        if (typeof createPath === 'function') {
          createPath.call(currentBead, context);
        }
        if (context.isPointInPath(loc.x, loc.y)) {
          found = true;
          // Play bead sound if we had one
          clickedBead(currentBead);
        }
      }
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    const drawAbacus3 = (abacus as AbacusWithDraw).draw;
    if (typeof drawAbacus3 === 'function') {
      drawAbacus3.call(abacus, context);
    }

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
    const drawAbacus4 = (abacus as AbacusWithDraw).draw;
    if (typeof drawAbacus4 === 'function') {
      drawAbacus4.call(abacus, context);
    }

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
