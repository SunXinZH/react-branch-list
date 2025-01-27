import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export var BranchListContext = React.createContext({
    provider: null,
    popToRenderItem: function () { return undefined; },
    onRenderItem: function (item) {
        return _jsx("div", { children: item.id });
    }
});
export var BranchListContextProvider = BranchListContext.Provider;
export function useBranchListContext() {
    return React.useContext(BranchListContext);
}
