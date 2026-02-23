/**
 * Airplane Boarding Simulation Engine
 *
 * Models a 20-row, 6-seat (3-3) aircraft cabin with a single aisle.
 * Passengers walk down the aisle, stow bags, and take their seats.
 * Different boarding methods are implemented as sort functions on the passenger queue.
 */

const ROWS = 20;
const COLS = 6; // 0-2 = left (A,B,C), 3-5 = right (D,E,F)
const TOTAL_PASSENGERS = ROWS * COLS;
const STOW_TIME_MIN = 3;
const STOW_TIME_MAX = 8;

// Passenger states
const STATE = {
  QUEUED: 'queued',
  WALKING: 'walking',
  STOWING: 'stowing',
  SEATED: 'seated',
};

class Passenger {
  constructor(row, col) {
    this.assignedRow = row;
    this.assignedCol = col;
    this.state = STATE.QUEUED;
    this.aislePos = -1; // -1 = not in the aisle yet
    this.stowTimer = 0;
    this.boardingGroup = 0;
  }

  reset() {
    this.state = STATE.QUEUED;
    this.aislePos = -1;
    this.stowTimer = 0;
  }
}

class BoardingSimulation {
  constructor() {
    this.passengers = [];
    this.queue = []; // ordered list of passengers waiting to enter
    this.aisleOccupant = new Array(ROWS).fill(null); // who is at each aisle position
    this.seats = []; // 2D array: seats[row][col] = passenger or null
    this.ticks = 0;
    this.seatedCount = 0;
    this.totalBlocks = 0; // times a passenger was blocked in the aisle
    this.concurrentStowers = 0; // current number of people stowing simultaneously
    this.peakParallel = 0; // max concurrent stowers seen
    this.done = false;

    // Create all passengers
    for (let r = 0; r < ROWS; r++) {
      this.seats[r] = new Array(COLS).fill(null);
      for (let c = 0; c < COLS; c++) {
        this.passengers.push(new Passenger(r, c));
      }
    }
  }

  /**
   * Initialize the simulation with a given boarding method.
   * @param {string} method - One of: 'back-to-front', 'front-to-back', 'random', 'wilma', 'steffen', 'steffen-modified'
   */
  init(method) {
    this.ticks = 0;
    this.seatedCount = 0;
    this.totalBlocks = 0;
    this.concurrentStowers = 0;
    this.peakParallel = 0;
    this.done = false;
    this.aisleOccupant = new Array(ROWS).fill(null);

    for (let r = 0; r < ROWS; r++) {
      this.seats[r] = new Array(COLS).fill(null);
    }

    this.passengers.forEach(p => p.reset());

    // Sort passengers into boarding order
    const sorted = this._sortByMethod(method);
    this.queue = sorted.slice();
  }

  /**
   * Advance the simulation by one tick.
   * Returns true if the simulation is still running.
   */
  tick() {
    if (this.done) return false;

    this.ticks++;

    // Process passengers in the aisle from back to front
    // (back first so moves don't cascade in a single tick)
    for (let pos = ROWS - 1; pos >= 0; pos--) {
      const p = this.aisleOccupant[pos];
      if (!p) continue;

      if (p.state === STATE.STOWING) {
        p.stowTimer--;
        if (p.stowTimer <= 0) {
          // Done stowing, take seat
          p.state = STATE.SEATED;
          this.seats[p.assignedRow][p.assignedCol] = p;
          this.aisleOccupant[pos] = null;
          this.seatedCount++;
        }
      } else if (p.state === STATE.WALKING) {
        if (p.aislePos === p.assignedRow) {
          // Reached our row, start stowing
          p.state = STATE.STOWING;
          p.stowTimer = STOW_TIME_MIN + Math.floor(Math.random() * (STOW_TIME_MAX - STOW_TIME_MIN + 1));
        } else {
          // Try to move forward (toward higher row numbers)
          const nextPos = p.aislePos + 1;
          if (nextPos < ROWS && this.aisleOccupant[nextPos] === null) {
            this.aisleOccupant[p.aislePos] = null;
            p.aislePos = nextPos;
            this.aisleOccupant[nextPos] = p;
          } else {
            // Blocked
            this.totalBlocks++;
          }
        }
      }
    }

    // Try to admit the next passenger from the queue
    if (this.queue.length > 0 && this.aisleOccupant[0] === null) {
      const p = this.queue.shift();
      p.state = STATE.WALKING;
      p.aislePos = 0;
      this.aisleOccupant[0] = p;
    }

    // Count concurrent stowers
    this.concurrentStowers = 0;
    for (let pos = 0; pos < ROWS; pos++) {
      if (this.aisleOccupant[pos] && this.aisleOccupant[pos].state === STATE.STOWING) {
        this.concurrentStowers++;
      }
    }
    if (this.concurrentStowers > this.peakParallel) {
      this.peakParallel = this.concurrentStowers;
    }

    // Check if done
    if (this.seatedCount === TOTAL_PASSENGERS) {
      this.done = true;
    }

    return !this.done;
  }

  // --- Boarding method sort functions ---

  _sortByMethod(method) {
    const list = this.passengers.slice();

    switch (method) {
      case 'back-to-front':
        return this._backToFront(list);
      case 'front-to-back':
        return this._frontToBack(list);
      case 'random':
        return this._random(list);
      case 'wilma':
        return this._wilma(list);
      case 'steffen':
        return this._steffen(list);
      case 'steffen-modified':
        return this._steffenModified(list);
      default:
        return this._random(list);
    }
  }

  _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  _backToFront(list) {
    // 4 zones of 5 rows each
    const zones = [
      list.filter(p => p.assignedRow >= 15), // rows 15-19 (back)
      list.filter(p => p.assignedRow >= 10 && p.assignedRow < 15),
      list.filter(p => p.assignedRow >= 5 && p.assignedRow < 10),
      list.filter(p => p.assignedRow < 5), // rows 0-4 (front)
    ];

    zones.forEach((zone, i) => {
      this._shuffleArray(zone);
      zone.forEach(p => p.boardingGroup = i + 1);
    });

    return zones.flat();
  }

  _frontToBack(list) {
    const zones = [
      list.filter(p => p.assignedRow < 5), // rows 0-4 (front)
      list.filter(p => p.assignedRow >= 5 && p.assignedRow < 10),
      list.filter(p => p.assignedRow >= 10 && p.assignedRow < 15),
      list.filter(p => p.assignedRow >= 15), // rows 15-19 (back)
    ];

    zones.forEach((zone, i) => {
      this._shuffleArray(zone);
      zone.forEach(p => p.boardingGroup = i + 1);
    });

    return zones.flat();
  }

  _random(list) {
    list.forEach(p => p.boardingGroup = 1);
    return this._shuffleArray(list);
  }

  _wilma(list) {
    // Group 1: window seats (cols 0, 5)
    // Group 2: middle seats (cols 1, 4)
    // Group 3: aisle seats (cols 2, 3)
    const windows = list.filter(p => p.assignedCol === 0 || p.assignedCol === 5);
    const middles = list.filter(p => p.assignedCol === 1 || p.assignedCol === 4);
    const aisles = list.filter(p => p.assignedCol === 2 || p.assignedCol === 3);

    this._shuffleArray(windows).forEach(p => p.boardingGroup = 1);
    this._shuffleArray(middles).forEach(p => p.boardingGroup = 2);
    this._shuffleArray(aisles).forEach(p => p.boardingGroup = 3);

    return [...windows, ...middles, ...aisles];
  }

  _steffen(list) {
    // Steffen perfect: maximizes parallel stowing by ensuring consecutive
    // passengers are 2 rows apart on alternating sides.
    // Order: window→middle→aisle, and within each seat type:
    //   right even rows (back→front), left odd rows (back→front),
    //   right odd rows (back→front), left even rows (back→front)
    const order = [];

    // Seat type pairs: [left col, right col]
    const seatTypes = [[0, 5], [1, 4], [2, 3]]; // window, middle, aisle

    for (const [leftCol, rightCol] of seatTypes) {
      // Sub-group 1: right side, even rows, back to front
      for (let row = ROWS - 2; row >= 0; row -= 2) {
        const p = list.find(p => p.assignedRow === row && p.assignedCol === rightCol);
        if (p) order.push(p);
      }
      // Sub-group 2: left side, odd rows, back to front
      for (let row = ROWS - 1; row >= 0; row -= 2) {
        const p = list.find(p => p.assignedRow === row && p.assignedCol === leftCol);
        if (p) order.push(p);
      }
      // Sub-group 3: right side, odd rows, back to front
      for (let row = ROWS - 1; row >= 0; row -= 2) {
        const p = list.find(p => p.assignedRow === row && p.assignedCol === rightCol);
        if (p) order.push(p);
      }
      // Sub-group 4: left side, even rows, back to front
      for (let row = ROWS - 2; row >= 0; row -= 2) {
        const p = list.find(p => p.assignedRow === row && p.assignedCol === leftCol);
        if (p) order.push(p);
      }
    }

    order.forEach((p, i) => p.boardingGroup = Math.floor(i / 10) + 1);

    return order;
  }

  _steffenModified(list) {
    // 4 groups: alternating rows x alternating sides
    // Group 1: even rows, right side (cols 3-5), back to front
    // Group 2: even rows, left side (cols 0-2), back to front
    // Group 3: odd rows, right side (cols 3-5), back to front
    // Group 4: odd rows, left side (cols 0-2), back to front
    // Within each group: window -> middle -> aisle
    const groups = [[], [], [], []];

    for (const p of list) {
      const isEvenRow = (p.assignedRow + 1) % 2 === 0;
      const isRight = p.assignedCol >= 3;

      if (isEvenRow && isRight) groups[0].push(p);
      else if (isEvenRow && !isRight) groups[1].push(p);
      else if (!isEvenRow && isRight) groups[2].push(p);
      else groups[3].push(p);
    }

    // Sort within each group: by column priority (window first), then back to front
    const colPriority = { 0: 0, 5: 0, 1: 1, 4: 1, 2: 2, 3: 2 };

    groups.forEach((group, gi) => {
      group.sort((a, b) => {
        const colDiff = colPriority[a.assignedCol] - colPriority[b.assignedCol];
        if (colDiff !== 0) return colDiff;
        return b.assignedRow - a.assignedRow; // back to front
      });
      group.forEach(p => p.boardingGroup = gi + 1);
    });

    return groups.flat();
  }
}
