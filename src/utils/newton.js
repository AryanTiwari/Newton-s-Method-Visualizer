import { createFunction, createDerivative, getDerivativeString } from './mathParser';

/**
 * Performs one iteration of Newton's method
 * @param {Function} f - The function
 * @param {Function} fPrime - The derivative function
 * @param {number} x - Current guess
 * @returns {{ nextX: number, fx: number, fPrimeX: number, tangentSlope: number, tangentIntercept: number }}
 */
export function newtonIteration(f, fPrime, x) {
  const fx = f(x);
  const fPrimeX = fPrime(x);

  if (Math.abs(fPrimeX) < 1e-12) {
    throw new Error(`Derivative is zero at x = ${x}. Newton's method cannot continue.`);
  }

  const nextX = x - fx / fPrimeX;

  // Tangent line: y - fx = fPrimeX * (t - x)
  // y = fPrimeX * t - fPrimeX * x + fx
  // y = fPrimeX * t + (fx - fPrimeX * x)
  const tangentSlope = fPrimeX;
  const tangentIntercept = fx - fPrimeX * x;

  return {
    nextX,
    fx,
    fPrimeX,
    tangentSlope,
    tangentIntercept
  };
}

/**
 * Creates a Newton's method solver for a given expression
 * @param {string} expression - Math expression like "x^2 - 2"
 * @returns {Object} Solver object with methods
 */
export function createNewtonSolver(expression) {
  const f = createFunction(expression);
  const fPrime = createDerivative(expression);
  const derivativeString = getDerivativeString(expression);

  let iterations = [];
  let currentX = null;

  return {
    /**
     * Sets the initial guess and resets iterations
     * @param {number} x0 - Initial guess
     * @throws {Error} If the function is undefined at x0 (vertical asymptote)
     */
    setInitialGuess(x0) {
      const fx0 = f(x0);
      const fPrimeX0 = fPrime(x0);

      // Check for undefined values (vertical asymptotes, etc.)
      if (!isFinite(fx0)) {
        throw new Error(`Function is undefined at x = ${x0.toFixed(4)} (vertical asymptote or singularity)`);
      }
      if (!isFinite(fPrimeX0)) {
        throw new Error(`Derivative is undefined at x = ${x0.toFixed(4)}`);
      }

      currentX = x0;
      iterations = [{
        n: 0,
        x: x0,
        fx: fx0,
        fPrimeX: fPrimeX0,
        tangentSlope: fPrimeX0,
        tangentIntercept: fx0 - fPrimeX0 * x0
      }];
    },

    /**
     * Performs the next iteration
     * @returns {Object} Iteration data
     */
    nextIteration() {
      if (currentX === null) {
        throw new Error('Initial guess not set');
      }

      const result = newtonIteration(f, fPrime, currentX);

      // Check if next x is valid
      if (!isFinite(result.nextX)) {
        throw new Error('Newton\'s method diverged to infinity');
      }

      const nextFx = f(result.nextX);
      const nextFPrimeX = fPrime(result.nextX);

      // Check for asymptotes at the next point
      if (!isFinite(nextFx)) {
        throw new Error(`Iteration landed on a singularity at x = ${result.nextX.toFixed(4)}`);
      }
      if (!isFinite(nextFPrimeX)) {
        throw new Error(`Derivative undefined at x = ${result.nextX.toFixed(4)}`);
      }

      currentX = result.nextX;

      const iterationData = {
        n: iterations.length,
        x: result.nextX,
        fx: nextFx,
        fPrimeX: nextFPrimeX,
        prevX: iterations[iterations.length - 1].x,
        tangentSlope: result.tangentSlope,
        tangentIntercept: result.tangentIntercept
      };

      iterations.push(iterationData);
      return iterationData;
    },

    /**
     * Gets all iterations so far
     * @returns {Array} All iteration data
     */
    getIterations() {
      return [...iterations];
    },

    /**
     * Gets the current x value
     * @returns {number}
     */
    getCurrentX() {
      return currentX;
    },

    /**
     * Evaluates the function at a point
     * @param {number} x
     * @returns {number}
     */
    evaluate(x) {
      return f(x);
    },

    /**
     * Gets the derivative string
     * @returns {string}
     */
    getDerivativeString() {
      return derivativeString;
    },

    /**
     * Checks if the method has converged
     * @param {number} tolerance - Convergence tolerance
     * @returns {boolean}
     */
    hasConverged(tolerance = 1e-10) {
      if (iterations.length < 2) return false;
      const lastFx = iterations[iterations.length - 1].fx;
      return Math.abs(lastFx) < tolerance;
    },

    /**
     * Resets the solver
     */
    reset() {
      iterations = [];
      currentX = null;
    }
  };
}

/**
 * Calculates convergence progress from initial |f(x)| toward target
 * @param {number} currentFx - Current |f(x)| value
 * @param {number} initialFx - Initial |f(x₀)| value (starting point)
 * @param {number} targetFx - Target |f(x)| for convergence (default 1e-10)
 * @returns {number} Progress from 0 (start) to 1 (converged)
 */
export function getConvergenceProgress(currentFx, initialFx, targetFx = 1e-10) {
  // Use absolute values
  const current = Math.abs(currentFx);
  const initial = Math.abs(initialFx);
  const target = targetFx;

  // Handle edge cases
  if (initial <= target || current <= 0) {
    return 1; // Already converged
  }
  if (current >= initial) {
    return 0; // At or worse than start
  }

  // Use logarithmic scale for progress calculation
  // progress = 0 when current = initial, progress = 1 when current = target
  const logInitial = Math.log10(initial);
  const logCurrent = Math.log10(Math.max(current, target)); // Clamp to target
  const logTarget = Math.log10(target);

  return Math.min(1, Math.max(0, (logInitial - logCurrent) / (logInitial - logTarget)));
}

/**
 * Generates colors for iterations based on convergence progress
 * @param {number} currentFx - Current |f(x)| value
 * @param {number} initialFx - Initial |f(x₀)| value (starting point)
 * @param {number} targetFx - Target |f(x)| for convergence (default 1e-10)
 * @returns {string} HSL color string
 */
export function getIterationColor(currentFx, initialFx, targetFx = 1e-10) {
  // Start at blue (200), end at green (120)
  const startHue = 200;
  const endHue = 120;

  const progress = getConvergenceProgress(currentFx, initialFx, targetFx);
  const hue = startHue + (endHue - startHue) * progress;
  return `hsl(${hue}, 70%, 50%)`;
}
