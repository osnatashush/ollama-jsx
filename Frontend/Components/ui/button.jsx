import React from 'react';

export default function Button({ children, ...props }) {
  return (
    <button style={{ padding: '0.5em 1em', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} {...props}>
      {children}
    </button>
  );
}
