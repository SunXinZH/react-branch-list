import React from "react";

import { Button, Stack } from "@mui/material";
import { BranchList, BranchListProvider } from "react-branch-list";
import { ListItem } from "./list-item";

export const BranchListDemo: React.FC = () => {
  const provider = React.useMemo(() => {
    return new BranchListProvider<{ content: string }>();
  }, []);
  return (
    <Stack direction="column" sx={{ flex: 1 }}>
      <Stack direction="row" sx={{ width: "100%", overflow: "hidden" }}>
        <Button
          onClick={() => {
            const len = provider.items.length;
            provider.push({
              id: `node-${len + 1}`,
              content: `content-${len + 1}`,
            });
          }}
        >
          ADD
        </Button>
        <Button
          onClick={() => {
            provider.clear();
          }}
        >
          Clear
        </Button>
      </Stack>
      <BranchList
        direction="column"
        provider={provider}
        onRenderItem={(item) => {
          return <ListItem id={item.id} content={item.content} />;
        }}
      />
    </Stack>
  );
};
