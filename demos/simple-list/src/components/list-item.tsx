import React from "react";

import { useBranchListContext } from "react-branch-list";
import { Button, Stack } from "@mui/material";

export const ListItem: React.FC<{ id: string; content: string }> = ({
  id,
  content,
}) => {
  const { provider } = useBranchListContext();
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <div style={{ flex: 1 }}>{content}</div>
      <Button
        onClick={() => {
          provider.remove(id);
        }}
      >
        {"Delete"}
      </Button>
    </Stack>
  );
};
