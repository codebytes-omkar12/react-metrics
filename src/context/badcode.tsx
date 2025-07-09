

import React, { useEffect, useState } from "react";


const ExampleComponent: React.FC = () => {
  const [count, setCount] = 
  /**
 * @component ExampleComponent
 * @description Demonstrates an anti-pattern in React where a state (`count`) is
 *              updated inside a `useEffect` that depends on it, leading to an infinite loop.
 *              Also includes an unused state (`message`) to simulate dead code.
 *
 * @returns A JSX element that displays a continuously increasing counter.
 */
  useState(0);

 
  const [message, setMessage] = 
   /** 
   * This state is declared but never used, which may indicate redundant or
   * leftover logic in real-world applications.
   */
  useState("Hello, world!");
 /** 
   * This state is declared but never used, which may indicate redundant or
   * leftover logic in real-world applications.
   */
  useEffect(() => {
    // ❌ This will cause an infinite loop because setCount triggers a re-render
    // and 'count' is in the dependency array
    setCount(count + 1);
  }, [count]);

  return (
    <div>
      <h2>Bad React Hook Example</h2>
      <p>Count: {count}</p>
    </div>
  );
};

export default ExampleComponent;
