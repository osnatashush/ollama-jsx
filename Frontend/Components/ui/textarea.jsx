import React from 'react';

export default function Textarea(props) {
  return (
    <textarea style={{ padding: '0.5em', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} {...props} />
  );
}
