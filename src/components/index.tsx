import React from "react";
import { IBranchListProvider, IBranchListController } from "./../common/types";
import { BranchListProvider } from "./../common/provider";

import { IBranchListProps } from "./types";
import { BranchListContextProvider } from "./context";
import { BranchNode } from "./node";

export interface IBranchListRef<T extends object = {}> {
  controller: IBranchListController<T>;
}

const _BranchList = <T extends object>(
  props: IBranchListProps<T>,
  ref: React.Ref<IBranchListRef<T>>
) => {
  const [provider] = React.useState<IBranchListProvider<T>>(
    props.provider || new BranchListProvider<T>(props.defaultItems || [])
  );

  React.useImperativeHandle(
    ref,
    () => ({
      controller: provider,
    }),
    [provider]
  );

  const value = React.useMemo(() => {
    return {
      provider,
      renderComponent: props.renderComponent,
    };
  }, [props.renderComponent, provider]);
  return (
    <BranchListContextProvider value={value}>
      <div
        className={`branch-list-root ${props.className}`}
        style={{
          display: "flex",
          flexDirection: props.direction,
        }}
      >
        {provider.items.length === 0 ? (
          <BranchNode />
        ) : (
          <React.Fragment>
            {provider.items.map((item) => {
              return <BranchNode defaultItemId={item.id} />;
            })}
          </React.Fragment>
        )}
      </div>
    </BranchListContextProvider>
  );
};

export const BranchList = React.forwardRef(_BranchList) as unknown as <
  T extends object
>(
  props: IBranchListProps<T> & {
    ref?: React.Ref<IBranchListRef<T>>;
  }
) => React.ReactElement;
