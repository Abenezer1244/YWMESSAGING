/**
 * Auto-generating Selectors Pattern for Zustand
 *
 * This utility creates type-safe selector hooks automatically from store state.
 * Instead of manually creating selectors, you get auto-completed hooks with zero boilerplate.
 *
 * Benefits:
 * - Type-safe selectors with auto-completion
 * - Prevents unnecessary re-renders (only re-render if selected value changes)
 * - Reduces boilerplate selector code
 * - Works with any Zustand store
 *
 * Usage:
 * ```
 * // Instead of manually selecting:
 * const user = useAuthStore((state) => state.user);
 * const isAuth = useAuthStore((state) => state.isAuthenticated);
 *
 * // Use auto-generated selectors:
 * const user = useAuthStore.use.user();
 * const isAuth = useAuthStore.use.isAuthenticated();
 * ```
 */
import { StoreApi, UseBoundStore } from 'zustand';
type WithSelectors<S> = S extends {
    getState: () => infer T;
} ? S & {
    use: {
        [K in keyof T]: () => T[K];
    };
} : never;
/**
 * createSelectors: Auto-generates selector hooks from Zustand store
 *
 * This function takes a Zustand store and returns it augmented with a `use` object
 * that contains selector hooks for each state property.
 *
 * Example:
 * ```typescript
 * // Before
 * const useAuthStore = create<AuthState>(...)
 * const user = useAuthStore((state) => state.user);
 *
 * // After
 * const useAuthStore = createSelectors(create<AuthState>(...));
 * const user = useAuthStore.use.user();  // ✅ Type-safe, auto-completes
 * ```
 *
 * How it works:
 * 1. Gets all keys from store state via getState()
 * 2. Creates a selector hook for each key
 * 3. Each selector only re-renders if that specific value changes
 * 4. Returns the original store with added `.use` object
 */
export declare const createSelectors: <S extends UseBoundStore<StoreApi<object>>>(_store: S) => WithSelectors<S>;
export {};
/**
 * Performance Notes:
 *
 * 1. Selector hooks only re-render when their specific value changes
 *    - `useAuthStore.use.user()` won't re-render if `isAuthenticated` changes
 *    - This is much better than manual selectors that might return new objects
 *
 * 2. Each selector is automatically memoized by Zustand
 *    - Zustand uses === comparison to determine if re-render is needed
 *    - Primitives (string, number, boolean) compare by value
 *    - Objects/arrays compare by reference (so use useShallow for objects)
 *
 * 3. For object/array state, use useShallow wrapper
 *    - `useAuthStore.use.user()` returns new object reference each time
 *    - Use useShallow to compare by shallow equality instead
 *    - Example: useShallow(useAuthStore.use.user())
 *
 * Example with useShallow:
 * ```typescript
 * import { useShallow } from 'zustand/react/shallow';
 *
 * function Component() {
 *   const user = useShallow(useAuthStore.use.user());
 *   // Now re-renders only when user properties change, not every time
 * }
 * ```
 */
//# sourceMappingURL=createSelectors.d.ts.map