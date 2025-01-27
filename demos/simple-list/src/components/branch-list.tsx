import React from "react";

import { Button, Stack } from "@mui/material";
import { BranchList, BranchListProvider, IBranchListItem } from "react-branch-list";
import { ListItem } from "./list-item";
import { DisposableStore } from "vsc-base-kits";

export const BranchListDemo: React.FC = () => {
  const provider = React.useMemo(() => {
    return new BranchListProvider<{ content: string }>();
  }, []);

  const onRenderItem =React.useCallback((item: IBranchListItem<{content: string}>)=>{
    return <ListItem id={item.id} content={item.content} />;
  },[])
  return (
    <Stack direction="column" sx={{ flex: 1,".branch-list":{
      flex:1
    } }}>
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
        className="branch-list"
        direction="column"
        provider={provider}
        onRenderItem={onRenderItem}
      />
    </Stack>
  );
};
