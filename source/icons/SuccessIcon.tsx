import * as React from 'react';
import { forwardRef } from 'react';

export default forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(function FailedIcon(
  props,
  ref
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
      ref={ref}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.563 9.75a12.014 12.014 0 00-3.427 5.136L9 12.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
});
