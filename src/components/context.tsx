import React from 'react';
import { IBranchListContext, IBranchListProps } from "./types"
import { IBranchListItem } from "./../common/types"



export const BranchListContext = React.createContext<IBranchListContext<any>>({
    provider: null as any,
    popToRenderItem: ()=> undefined,
    onRenderItem: (item:IBranchListItem<any>) => {
        return <div>{item.id}</div>
    }
});

export const BranchListContextProvider = BranchListContext.Provider;

export function useBranchListContext<T extends object>(): IBranchListContext<T> {
    return React.useContext(BranchListContext) as IBranchListContext<T>;
}