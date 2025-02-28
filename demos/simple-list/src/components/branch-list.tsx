import React from 'react';

import { Button, Stack, Divider } from '@mui/material';
import { BranchList, IBranchListRef, IBranchListItem } from 'react-branch-list';
import { ListItem } from './list-item';

type ContentType = { content: string };

const ItemComponent: React.FC<IBranchListItem<ContentType>> = ({ id, content }) => {
  return <ListItem id={id} content={content} />;
};

export const BranchListDemo: React.FC = () => {
  const provider = React.useRef<IBranchListRef<ContentType> | null>(null);

  return (
    <Stack
      direction="column"
      sx={{
        flex: 1,
        width: '300px',
        '.branch-list': {
          flex: 1,
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ width: '100%', overflow: 'hidden', padding: '4px' }}>
        <Button
          variant="contained"
          sx={{ flex: 1 }}
          onClick={async () => {
            const len = provider.current?.controller.items.length ?? 0;

            for (let index = 1; index < 11; index++) {
              await provider.current?.controller.push({
                id: `node-${len + index}`,
                content: `content-${len + index}`,
              });
            }
          }}
        >
          ADD 10 Items
        </Button>
        <Button
          sx={{ flex: 1 }}
          variant="contained"
          onClick={() => {
            provider.current?.controller.clear();
          }}
        >
          Clear
        </Button>
      </Stack>
      <Divider />
      <BranchList<ContentType>
        ref={provider}
        className="branch-list"
        direction="column"
        renderComponent={ItemComponent}
        defaultItems={new Array(5).fill(1).map((_, index) => {
          return {
            id: `node-${index}`,
            content: `content-${index}`,
          };
        })}
      />
    </Stack>
  );
};
