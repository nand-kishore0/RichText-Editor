/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce(func: Function, wait: number): Function {
  let timeout: number | null = null

  return function (...args: any[]) {
    const later = () => {
      timeout = null
      func.apply(this, args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = window.setTimeout(later, wait)
  }
}
