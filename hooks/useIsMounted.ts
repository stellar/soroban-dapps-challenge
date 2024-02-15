import React from "react";

/**
 * Custom hook that returns a boolean value indicating whether the component is mounted or not.
 * @returns {boolean} A boolean value indicating whether the component is mounted.
 */
export function useIsMounted() {
  const [mounted, setMounted] = React.useReducer(() => true, false);
  React.useEffect(setMounted, [setMounted]);
  return mounted;
}
