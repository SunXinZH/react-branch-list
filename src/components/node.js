import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useBranchListContext } from "./context";
var RenderNode = function (_a) {
    var defaultItemId = _a.defaultItemId;
    var _b = React.useState(defaultItemId), itemId = _b[0], setItemId = _b[1];
    var _c = useBranchListContext(), provider = _c.provider, onRenderItem = _c.onRenderItem;
    var divRef = React.useRef(null);
    var content = React.useMemo(function () {
        var item = provider.get(itemId);
        return item ? onRenderItem(item) : _jsx("div", { className: "discarded-node" });
    }, [itemId, onRenderItem, provider]);
    React.useEffect(function () {
        if (itemId) {
            provider.notifyItemRendered(itemId);
        }
    }, [itemId, provider]);
    React.useEffect(function () {
        return function () {
            if (itemId) {
                provider.notifyItemDisposed(itemId);
            }
        };
    }, [provider, itemId]);
    React.useEffect(function () {
        var d = provider.onDidChanged(function (e) {
            if (e.type === "remove" && e.item === itemId) {
                setItemId("");
            }
        });
        return function () {
            d.dispose();
        };
    }, [itemId]);
    React.useEffect(function () {
        var onUpdateOrder = function () {
            if (divRef.current) {
                if (itemId) {
                    divRef.current.style.order = provider.indexOf(itemId).toString();
                }
                else {
                    divRef.current.style.order = "";
                }
            }
        };
        var d = provider.onPositionChanged(function () {
            onUpdateOrder();
        });
        onUpdateOrder();
        return function () {
            d.dispose();
        };
    }, []);
    return (_jsx("div", { ref: divRef, className: "branch-render-node", children: content }));
};
var ObserveNode = function () {
    var _a = useBranchListContext(), provider = _a.provider, popToRenderItem = _a.popToRenderItem;
    var currentId = React.useRef(null);
    var _b = React.useState(null), id = _b[0], setId = _b[1];
    React.useEffect(function () {
        var d = provider.onDidChanged(function (e) {
            if (e.type === "add" &&
                currentId.current === null &&
                !e.barrier.isOpen()) {
                d.dispose();
                currentId.current = e.item;
                setId(e.item);
                e.barrier.open();
            }
        });
        var toRenderItem = popToRenderItem();
        if (toRenderItem) {
            d.dispose();
            currentId.current = toRenderItem.id;
            setId(toRenderItem.id);
            toRenderItem.barrier.open();
        }
        return function () {
            d.dispose();
        };
    }, [provider]);
    return (_jsx(React.Fragment, { children: id && _jsx(BranchNode, { defaultItemId: id }) }));
};
export var BranchNode = function (_a) {
    var _b = _a.defaultItemId, defaultItemId = _b === void 0 ? undefined : _b;
    return (_jsxs(React.Fragment, { children: [defaultItemId && _jsx(RenderNode, { defaultItemId: defaultItemId }), _jsx(ObserveNode, {})] }));
};
