/**
 * Stack Overflow Detection Utility
 * Helps identify and prevent recursive calls that could cause "Maximum call stack size exceeded"
 */

let callDepth = 0;
const MAX_CALL_DEPTH = 100;
const callStack: string[] = [];

/**
 * Monitors function calls to detect potential stack overflow conditions
 * Use this decorator for functions that might be called recursively
 */
export const withStackOverflowProtection = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): T => {
  return ((...args: any[]) => {
    callDepth++;
    callStack.push(functionName);
    
    if (callDepth > MAX_CALL_DEPTH) {
      const recentCalls = callStack.slice(-10).join(' -> ');
      console.error(`🚨 STACK OVERFLOW DETECTED: Call depth exceeded ${MAX_CALL_DEPTH}`);
      console.error(`Recent call chain: ${recentCalls}`);
      console.error('Stack trace:', new Error().stack);
      
      // Reset to prevent further errors
      callDepth = 0;
      callStack.length = 0;
      
      throw new Error(`Stack overflow prevented in ${functionName}. Recent calls: ${recentCalls}`);
    }
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          callDepth--;
          callStack.pop();
        });
      }
      
      callDepth--;
      callStack.pop();
      return result;
    } catch (error) {
      callDepth--;
      callStack.pop();
      throw error;
    }
  }) as T;
};

/**
 * Throttle function calls to prevent rapid-fire executions
 * Useful for preventing event storms that could lead to stack overflow
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      lastExecTime = currentTime;
      return fn(...args);
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      lastExecTime = Date.now();
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;
};

/**
 * Debounce function calls to prevent excessive executions
 * Useful for state update handlers that might trigger cascading updates
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  }) as T;
};

/**
 * Monitor useEffect calls to detect dependency loops
 */
export const logEffectExecution = (effectName: string, dependencies: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Effect "${effectName}" executed with deps:`, dependencies);
  }
};

/**
 * Reset call depth counter (useful for testing)
 */
export const resetCallDepth = () => {
  callDepth = 0;
  callStack.length = 0;
};