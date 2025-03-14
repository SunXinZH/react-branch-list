import React from 'react';
import { IBranchListContext } from './types';
import { IBranchListProvider } from './../common/types';

export const BranchListContext = React.createContext<IBranchListContext>({
  provider: null as unknown as IBranchListProvider,
  renderComponent: ({ id }) => <div>{id}</div>,
});

export const BranchListContextProvider = BranchListContext.Provider;

export function useBranchListContext<T extends object>(): IBranchListContext<T> {
  return React.useContext(BranchListContext) as unknown as IBranchListContext<T>;
}

export function useBranchListProvider<T extends object>(): IBranchListProvider<T> {
  const { provider } = React.useContext(BranchListContext) as unknown as IBranchListContext<T>;
  return provider;
}
