// Abacus logic extracted from components/abacus-display.tsx

export class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export class Bead {
  constructor(
    public rod: Rod,
    public heaven: boolean,
    public order: number,
    public active: boolean,
  ) {}

  getPoints(): Point[] {
    const points: Point[] = [];
    const center = this.evalPosition();
    points.push(new Point(center.x - 28, center.y));
    points.push(new Point(center.x + 28, center.y));
    points.push(new Point(center.x + 9.33, center.y - 15));
    points.push(new Point(center.x - 9.33, center.y - 15));
    points.push(new Point(center.x - 28, center.y));
    points.push(new Point(center.x - 9.33, center.y + 15));
    points.push(new Point(center.x + 9.33, center.y + 15));
    points.push(new Point(center.x + 28, center.y));
    return points;
  }

  evalPosition(): Point {
    // This method should be implemented by the display component, as it depends on canvas context and layout
    return new Point(0, 0);
  }

  reset(): void {
    this.active = false;
  }
}

export class Rod {
  constructor(
    public position: number,
    public beads: Bead[],
    public value = 0,
    public disabled = false,
    public invisible = false,
  ) {}

  reset(): void {
    for (let i = 0; i < this.beads.length; i++) {
      this.beads[i].reset();
    }
    this.value = 0;
  }
}

export class Abacus {
  rods: Rod[] = [];
  middleRod: number;
  width: number;

  constructor(
    public numberOfRods: number,
    public mode = "normal",
    public frameColor: string = "black",
    public showNumbers = true,
    public clockMode = false,
  ) {
    for (let i = 0; i < numberOfRods; i++) {
      const beads: Bead[] = [];
      const rod = new Rod(i + 1, beads, 0, false);
      for (let j = 0; j < 5; j++) {
        let bead: Bead;
        if (j === 0) {
          bead = new Bead(rod, true, j, false);
        } else {
          bead = new Bead(rod, false, j, false);
        }
        beads.push(bead);
      }
      this.rods.push(rod);
    }
    this.middleRod = Math.floor(numberOfRods / 2) + 1;
    this.width = 60 * (numberOfRods + 1); // DISTANCE_RODS default
    if (clockMode) {
      this.hideClockUselessRods();
    }
  }

  reset(): void {
    for (let i = 0; i < this.numberOfRods; i++) {
      const rod = this.rods[i];
      rod.reset();
    }
    this.showNumbers = true;
  }

  hideClockUselessRods(): void {
    this.rods[this.numberOfRods - 3].invisible = true;
    this.rods[this.numberOfRods - 6].invisible = true;
    this.rods[this.numberOfRods - 9].invisible = true;
  }

  showClockUselessRods(): void {
    this.rods[this.numberOfRods - 3].invisible = false;
    this.rods[this.numberOfRods - 6].invisible = false;
    this.rods[this.numberOfRods - 9].invisible = false;
  }

  disableAllRods(): void {
    for (let i = 0; i < this.numberOfRods; i++) {
      const rod = this.rods[i];
      rod.disabled = true;
    }
  }
} 