import React from "react";

import { Button, Stack, Divider } from "@mui/material";
import {
  BranchList,
  BranchListProvider,
  IBranchListItem,
} from "react-branch-list";
import { ListItem } from "./list-item";

export const BranchListDemo: React.FC = () => {
  const provider = React.useMemo(() => {
    return new BranchListProvider<{ content: string }>();
  }, []);

  const onRenderItem = React.useCallback(
    (item: IBranchListItem<{ content: string }>) => {
      return <ListItem id={item.id} content={item.content} />;
    },
    []
  );
  return (
    <Stack
      direction="column"
      sx={{
        flex: 1,
        width: "300px",
        ".branch-list": {
          flex: 1,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ width: "100%", overflow: "hidden", padding: "4px" }}
      >
        <Button
          variant="contained"
          sx={{ flex: 1 }}
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
          sx={{ flex: 1 }}
          variant="contained"
          onClick={() => {
            provider.clear();
          }}
        >
          Clear
        </Button>
      </Stack>
      <Divider />
      <BranchList
        className="branch-list"
        direction="column"
        provider={provider}
        onRenderItem={onRenderItem}
      />
    </Stack>
  );
};
