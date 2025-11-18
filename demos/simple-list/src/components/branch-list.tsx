import React from 'react';

import { BranchList, IBranchListItem, BranchListProvider } from 'react-branch-list';
import { ListItem } from './list-item';

type ContentType = { content: string };

const ItemComponent: React.FC<IBranchListItem<ContentType>> = ({ id, content }) => {
  return <ListItem id={id} content={content} />;
};

export const BranchListDemo: React.FC = () => {
  const provider = React.useMemo<BranchListProvider<ContentType>>(() => {
    return new BranchListProvider<ContentType>(
      new Array(5).fill(1).map((_, index) => {
        return {
          id: `node-${index}`,
          content: `content-${index}`,
        };
      }),
    );
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        width: '300px',
        // '.branch-list': {
        //   flex: 1,
        // },
      }}
    >
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          padding: '4px',
          gap: '8px',
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '20px',
        }}
      >
        <button
          style={{ flex: 1 }}
          onClick={async () => {
            const len = provider.items.length ?? 0;

            for (let index = 1; index < 11; index++) {
              await provider.push({
                id: `node-${len + index}`,
                content: `content-${len + index}`,
              });
            }
          }}
        >
          ADD 10 Items
        </button>
        <button
          style={{ flex: 1 }}
          onClick={() => {
            provider.clear();
          }}
        >
          Clear
        </button>
      </div>

      <BranchList<ContentType>
        provider={provider}
        className="branch-list"
        direction="column"
        renderComponent={ItemComponent}
      />
    </div>
  );
};
