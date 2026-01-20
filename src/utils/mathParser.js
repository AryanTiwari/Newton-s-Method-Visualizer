import { parse, compile, derivative } from "mathjs";

/**
 * Creates a callable function from a math expression string
 * @param {string} expression - Math expression like "x^2 - 2" or "sin(x)"
 * @returns {Function} A function that takes x and returns f(x)
 */
export function createFunction(expression) {
  try {
    const compiled = compile(expression);
    return (x) => {
      try {
        return compiled.evaluate({ x });
      } catch {
        return NaN;
      }
    };
  } catch (error) {
    throw new Error(`Invalid expression: ${error.message}`);
  }
}

/**
 * Creates the derivative function from a math expression string
 * Uses symbolic differentiation from mathjs
 * @param {string} expression - Math expression like "x^2 - 2"
 * @returns {Function} A function that takes x and returns f'(x)
 */
export function createDerivative(expression) {
  try {
    const derivativeExpr = derivative(expression, "x");
    const compiled = compile(derivativeExpr.toString());
    return (x) => {
      try {
        return compiled.evaluate({ x });
      } catch {
        return NaN;
      }
    };
  } catch (error) {
    // Fallback to numerical derivative if symbolic fails
    console.warn("Symbolic derivative failed, using numerical approximation");
    const f = createFunction(expression);
    return (x) => numericalDerivative(f, x);
  }
}

/**
 * Computes numerical derivative using central difference
 * @param {Function} f - The function
 * @param {number} x - The point at which to evaluate
 * @param {number} h - Step size (default: 1e-8)
 * @returns {number} Approximate derivative f'(x)
 */
export function numericalDerivative(f, x, h = 1e-8) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/**
 * Validates a math expression
 * @param {string} expression - Math expression to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateExpression(expression) {
  if (!expression || expression.trim() === "") {
    return { valid: false, error: "Expression cannot be empty" };
  }

  const trimmed = expression.trim();

  // Check for function names without arguments
  const functionsRequiringArgs = [
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "asinh",
    "acosh",
    "atanh",
    "log",
    "log10",
    "log2",
    "ln",
    "exp",
    "sqrt",
    "abs",
    "ceil",
    "floor",
    "round",
    "sign",
  ];

  // Check if expression is just a function name without parentheses
  for (const func of functionsRequiringArgs) {
    // Match function name at word boundary without opening parenthesis after it
    const regex = new RegExp(`\\b${func}\\b(?!\\s*\\()`, "i");
    if (regex.test(trimmed)) {
      return {
        valid: false,
        error: `Function "${func}" requires an argument, e.g., ${func}(x)`,
      };
    }
  }

  // Check for random strings that aren't valid math
  // If expression doesn't contain x, operators, numbers, or known functions, it's likely invalid
  const validMathPattern =
    /^[\s\d\.\+\-\*\/\^\(\)x]|sin|cos|tan|log|exp|sqrt|pi|e|abs/i;
  if (!validMathPattern.test(trimmed)) {
    // Additional check - try to parse and see if it makes sense
    try {
      const f = createFunction(trimmed);
      const testValue = f(1);
      if (typeof testValue !== "number" || isNaN(testValue)) {
        return {
          valid: false,
          error: "Invalid expression - please enter a valid function of x",
        };
      }
    } catch {
      return {
        valid: false,
        error: "Invalid expression - please enter a valid function of x",
      };
    }
  }

  try {
    parse(expression);
    // Try to evaluate at a test point to catch runtime errors
    const f = createFunction(expression);
    const testValue = f(1);
    if (typeof testValue !== "number") {
      return { valid: false, error: "Expression must evaluate to a number" };
    }
    if (isNaN(testValue)) {
      // Try another test point in case x=1 is a singularity
      const testValue2 = f(2);
      if (isNaN(testValue2)) {
        return {
          valid: false,
          error: "Invalid expression - cannot evaluate function",
        };
      }
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Gets a string representation of the derivative
 * @param {string} expression - The original expression
 * @returns {string} The derivative expression as a string
 */
export function getDerivativeString(expression) {
  try {
    const derivativeExpr = derivative(expression, "x");
    return derivativeExpr.toString();
  } catch {
    return "f'(x)";
  }
}
