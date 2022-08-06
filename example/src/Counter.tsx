import { Fragment, useEffect, useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setCount(count + 1), 100);
    return () => clearInterval(interval);
  });

  return <Fragment>{count}</Fragment>;
};
