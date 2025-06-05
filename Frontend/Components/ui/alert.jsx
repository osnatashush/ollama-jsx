import React from 'react';

export default function Alert({ children, ...props }) {
  return (
    <div style={{ padding: '1em', background: '#ffeeba', border: '1px solid #f5c06f', borderRadius: '4px', margin: '1em 0' }} {...props}>
      {children}
    </div>
  );
}
