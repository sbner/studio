
import { useState, useEffect, useCallback, useRef } from 'react';

// Helper to read from localStorage, ensures it runs only on client
function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // Ensure defaultValue is returned if item is null, undefined, or parsing fails
    return item != null ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T // This is the prop passed to the hook
): [T, (value: T | ((val: T) => T)) => void] {

  // Initialize state by reading from localStorage.
  // The function passed to useState runs only on the initial render on the client side.
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStoredValue(key, initialValue); // Use `initialValue` prop directly here for initial setup
  });

  // Keep a ref to the initialValue prop to use as a stable fallback in effects
  // if the initialValue prop itself is an unstable reference (like [] passed from parent).
  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);


  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function, passing the current storedValue for updates
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue] // Dependencies for useCallback
  );

  // Effect to update storedValue if the `key` prop itself changes.
  // This handles cases where the hook is re-used with a different localStorage key.
  useEffect(() => {
    const newValueFromStorage = getStoredValue(key, initialValueRef.current);
    // Avoid unnecessary re-renders if the value hasn't actually changed.
    if (JSON.stringify(newValueFromStorage) !== JSON.stringify(storedValue)) {
      setStoredValue(newValueFromStorage);
    }
    // This effect should only re-run if `key` changes.
    // `initialValueRef.current` provides a stable version of initialValue.
    // `storedValue` is included in deps because it's used in the comparison to prevent re-set.
  }, [key, storedValue]);

  // Effect to listen for storage changes from other tabs/windows.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        let newValue;
        if (event.newValue != null) { // Check for null or undefined
          try {
            newValue = JSON.parse(event.newValue);
          } catch (error) {
            console.warn(`Error parsing storage event for key "${key}":`, error);
            newValue = initialValueRef.current; // Fallback to initial value from ref
          }
        } else {
          // Item was removed or cleared in another tab.
          newValue = initialValueRef.current; // Fallback to initial value from ref
        }

        // Only update state if the new value is actually different from the current.
        if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
          setStoredValue(newValue);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    // This effect should re-subscribe if `key` changes.
    // `storedValue` is used in the comparison, so it should be a dependency.
  }, [key, storedValue]);

  return [storedValue, setValue];
}
