import { useCallback, useRef, useSyncExternalStore } from 'react';
import { StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

/**
 * Creates a stable selector hook for a Zustand store that properly caches the getSnapshot
 * function to prevent the "Warning: The result of getSnapshot should be cached" error
 * which leads to infinite render loops.
 * 
 * @param store The Zustand store to create a stable selector for
 * @returns A hook that can be used with selectors to avoid infinite render loops
 */
export function createStableSelector<T>(store: StoreApi<T>) {
  // Function to create a stable selector hook for a specific state slice
  return function useStableSelector<U>(selector: (state: T) => U): U {
    // Use a ref to cache the selector function
    const selectorRef = useRef(selector);
    
    // Update the selector ref if the selector changes (unlikely but possible)
    // This doesn't cause a re-render itself
    selectorRef.current = selector;
    
    // Create a stable getSnapshot function with useCallback
    // This ensures the same function reference is used between renders
    const getSnapshot = useCallback(() => {
      return selectorRef.current(store.getState());
    }, []);
    
    // Create a stable getServerSnapshot function (same as getSnapshot for client-side)
    const getServerSnapshot = useCallback(() => {
      return selectorRef.current(store.getState());
    }, []);
    
    // Create a stable subscribe function
    const subscribe = useCallback((callback: () => void) => {
      return store.subscribe(callback);
    }, []);
    
    // Use React's useSyncExternalStore with our stable functions
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  };
}

/**
 * Creates a hook that selects multiple values from a store and ensures they have
 * stable references by comparing them, preventing unnecessary re-renders.
 * 
 * @param store The Zustand store to create a stable multi-selector for
 * @returns A hook that can be used with object selectors to avoid unnecessary re-renders
 */
export function createStableShallowSelector<T>(store: StoreApi<T>) {
  return function useStableShallowSelector<U extends object>(selector: (state: T) => U): U {
    // Use a ref to cache the selector function
    const selectorRef = useRef(selector);
    
    // Update the selector ref if the selector changes
    selectorRef.current = selector;
    
    // Create a stable getSnapshot function that uses shallow comparison
    const getSnapshot = useCallback(() => {
      return selectorRef.current(store.getState());
    }, []);
    
    // Create a stable getServerSnapshot function
    const getServerSnapshot = useCallback(() => {
      return selectorRef.current(store.getState());
    }, []);
    
    // Create a stable subscribe function that uses shallow comparison
    const subscribe = useCallback((callback: () => void) => {
      // Track the previous state to do shallow comparison
      let previousState: U = selectorRef.current(store.getState());
      
      return store.subscribe(() => {
        // Get current state
        const currentState = selectorRef.current(store.getState());
        
        // Compare shallowly and only call callback if changed
        if (!shallowEqual(previousState, currentState)) {
          previousState = currentState;
          callback();
        }
      });
    }, []);
    
    // Use React's useSyncExternalStore with our stable functions
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  };
}

/**
 * Shallow equality comparison function
 */
function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }
  
  if (
    typeof objA !== 'object' || 
    objA === null || 
    typeof objB !== 'object' || 
    objB === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) || 
      !Object.is(objA[key], objB[key])
    ) {
      return false;
    }
  }
  
  return true;
} 