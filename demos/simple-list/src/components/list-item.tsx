import React from "react";

import { useBranchListProvider } from "react-branch-list";
import { Button, Stack, Typography } from "@mui/material";

export const ListItem: React.FC<{ id: string; content: string }> = ({
  id,
  content,
}) => {
  const provider = useBranchListProvider();
  return (
    <Stack
      direction="row"
      sx={{ width: "100%", border: " 1px solid #black", marginBottom: "4px" }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography style={{ alignSelf: "center", margin: "auto" }}>
          {content}
        </Typography>
      </div>
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
