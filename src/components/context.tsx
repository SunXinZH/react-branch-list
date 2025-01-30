import React from "react";
import { IBranchListContext } from "./types";
import { IBranchListProvider } from "./../common/types";

export const BranchListContext = React.createContext<IBranchListContext<any>>({
  provider: null as any,
  popToRenderItem: () => undefined,
  renderComponent: ({ item }) => <div>{item.id}</div>,
});

export const BranchListContextProvider = BranchListContext.Provider;

export function useBranchListContext<
  T extends object
>(): IBranchListContext<T> {
  return React.useContext(BranchListContext) as IBranchListContext<T>;
}

export function useBranchListProvider<
  T extends object
>(): IBranchListProvider<T> {
  const { provider } = React.useContext(
    BranchListContext
  ) as IBranchListContext<T>;
  return provider;
}
