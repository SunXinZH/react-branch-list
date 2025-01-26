import React from "react";
import { IBranchListProvider } from "./../common/types";
import { BranchListProvider } from "./../common/provider";

import { IBranchListProps, IToRenderItem } from "./types";
import { BranchListContextProvider } from "./context";
import { BranchNode } from "./node";

interface IBranchListRef<T extends object> {
  provider: IBranchListProvider<T>;
}

export function BranchList<T extends object>(
  props: IBranchListProps<T>,
  ref: React.Ref<IBranchListRef<T>>
) {
  const providerRef = React.useRef<IBranchListProvider<T>>(
    props.provider || new BranchListProvider<T>(props.defaultItems || [])
  );
  const toRenderItems = React.useRef<IToRenderItem[]>([]);

  React.useEffect(() => {
    const d = providerRef.current.onDidChanged((e) => {
      if (e.type === "add") {
        setTimeout(() => {
          if (!e.barrier.isOpen()) {
            toRenderItems.current.push({
              id: e.item,
              barrier: e.barrier,
            });
          }
        }, 0);
      }
    });

    return () => {
      d.dispose();
    };
  }, []);
  React.useImperativeHandle(
    ref,
    () => ({
      provider: providerRef.current,
    }),
    [providerRef]
  );

  const popToRenderItem = React.useCallback(() => {
    return toRenderItems.current.pop();
  }, []);
  return (
    <BranchListContextProvider
      value={{
        popToRenderItem,
        provider: providerRef.current,
        onRenderItem: props.onRenderItem,
      }}
    >
      <div
        className={`branch-list-root ${props.className}`}
        style={{
          display: "flex",
          flexDirection: props.direction,
        }}
      >
        {providerRef.current.items.length === 0 ? (
          <BranchNode />
        ) : (
          <React.Fragment>
            {providerRef.current.items.map((item) => {
              return <BranchNode defaultItemId={item.id} />;
            })}
          </React.Fragment>
        )}
      </div>
    </BranchListContextProvider>
  );
}
