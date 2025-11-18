import React from 'react';

import { useBranchListProvider } from 'react-branch-list';

export const ListItem: React.FC<{ id: string; content: string }> = ({ id, content }) => {
  const provider = useBranchListProvider();
  return (
    <div style={{ width: '100%', border: ' 1px solid #black', marginBottom: '4px', display:"flex", flexDirection:"row" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ alignSelf: 'center', margin: 'auto' }}>{content}</span>
      </div>
      <button
        style={{ border: "1px solid grey"}}
        onClick={() => {
          provider.remove(id);
        }}
      >
        {'Delete'}
      </button>
    </div>
  );
};
