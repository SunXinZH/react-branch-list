import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { BranchListProvider } from "./../common/provider";
import { BranchListContextProvider } from "./context";
import { BranchNode } from "./node";
function _BranchList(props, ref) {
    var providerRef = React.useRef(props.provider || new BranchListProvider(props.defaultItems || []));
    var toRenderItems = React.useRef([]);
    React.useEffect(function () {
        var d = providerRef.current.onDidChanged(function (e) {
            if (e.type === "add") {
                setTimeout(function () {
                    if (!e.barrier.isOpen()) {
                        toRenderItems.current.push({
                            id: e.item,
                            barrier: e.barrier,
                        });
                    }
                }, 0);
            }
        });
        return function () {
            console.log(">>>> 111 dispose");
            d.dispose();
        };
    }, []);
    React.useImperativeHandle(ref, function () { return ({
        provider: providerRef.current,
    }); }, [providerRef]);
    var popToRenderItem = React.useCallback(function () {
        var item = toRenderItems.current.pop();
        console.log(">>> popToRenderItem", item);
        return item;
    }, []);
    var value = React.useMemo(function () {
        return {
            popToRenderItem: popToRenderItem,
            provider: providerRef.current,
            onRenderItem: props.onRenderItem,
        };
    }, [popToRenderItem, props.onRenderItem]);
    return (_jsx(BranchListContextProvider, { value: value, children: _jsx("div", { className: "branch-list-root ".concat(props.className), style: {
                display: "flex",
                flexDirection: props.direction,
            }, children: providerRef.current.items.length === 0 ? (_jsx(BranchNode, {})) : (_jsx(React.Fragment, { children: providerRef.current.items.map(function (item) {
                    return _jsx(BranchNode, { defaultItemId: item.id });
                }) })) }) }));
}
export var BranchList = React.memo(_BranchList);
