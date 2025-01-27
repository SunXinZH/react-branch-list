var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Disposable, Emitter, Barrier, Throttler } from "vsc-base-kits";
var BranchListProvider = /** @class */ (function (_super) {
    __extends(BranchListProvider, _super);
    function BranchListProvider(defaultItems) {
        if (defaultItems === void 0) { defaultItems = []; }
        var _this = _super.call(this) || this;
        _this._items = [];
        _this._onDidChanged = _this._register(new Emitter());
        _this._onPositionChanged = _this._register(new Emitter());
        _this._onItemRendered = _this._register(new Emitter());
        _this._onItemDisposed = _this._register(new Emitter());
        _this._throttler = new Throttler();
        _this.onDidChanged = _this._onDidChanged.event;
        _this.onPositionChanged = _this._onPositionChanged.event;
        _this.onItemRendered = _this._onItemRendered.event;
        _this.onItemDisposed = _this._onItemDisposed.event;
        _this._items = defaultItems;
        if (_this.items.length > 0) {
            var itemsId = defaultItems.map(function (v) { return v.id; });
            _this._initPromise = Promise.all(itemsId.map(function (id) {
                return new Promise(function (resolve) {
                    var d = _this.onItemRendered(function (e) {
                        if (e === id) {
                            d.dispose();
                            resolve();
                        }
                    });
                });
            }));
        }
        return _this;
    }
    Object.defineProperty(BranchListProvider.prototype, "items", {
        get: function () {
            return this._items;
        },
        enumerable: false,
        configurable: true
    });
    BranchListProvider.prototype.indexOf = function (id) {
        return this._items.findIndex(function (v) { return v.id === id; });
    };
    BranchListProvider.prototype.get = function (id) {
        return this._items.find(function (v) { return v.id === id; });
    };
    BranchListProvider.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.awaitInit()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._throttler.queue(function () { return __awaiter(_this, void 0, void 0, function () {
                                var newItems;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            (_a = this._items).push.apply(_a, items);
                                            newItems = items.map(function (v) { return v.id; });
                                            return [4 /*yield*/, this.waitRenderItems(newItems)];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.insert = function (index) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.awaitInit()];
                    case 1:
                        _a.sent();
                        if (index < 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._throttler.queue(function () { return __awaiter(_this, void 0, void 0, function () {
                                var newItems;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            (_a = this._items).splice.apply(_a, __spreadArray([index, 0], items, false));
                                            newItems = items.map(function (v) { return v.id; });
                                            return [4 /*yield*/, this.waitRenderItems(newItems)];
                                        case 1:
                                            _b.sent();
                                            this._onPositionChanged.fire();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.remove = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.awaitInit()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._throttler.queue(function () { return __awaiter(_this, void 0, void 0, function () {
                                var index, p;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            index = this._items.findIndex(function (item) { return item.id === id; });
                                            if (!(index !== -1)) return [3 /*break*/, 2];
                                            p = new Promise(function (resolve) {
                                                var d = _this.onItemDisposed(function (e) {
                                                    if (e === id) {
                                                        d.dispose();
                                                        resolve();
                                                    }
                                                });
                                            });
                                            this._items.splice(index, 1);
                                            this._onDidChanged.fire({
                                                type: "remove",
                                                item: id,
                                            });
                                            this._onPositionChanged.fire();
                                            return [4 /*yield*/, p];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.move = function (id, index) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.awaitInit()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._throttler.queue(function () { return __awaiter(_this, void 0, void 0, function () {
                                var currentIndex, item;
                                return __generator(this, function (_a) {
                                    currentIndex = this._items.findIndex(function (item) { return item.id === id; });
                                    if (currentIndex !== -1) {
                                        item = this._items.splice(currentIndex, 1)[0];
                                        this._items.splice(index, 0, item);
                                        this._onPositionChanged.fire();
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.awaitInit()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._throttler.queue(function () { return __awaiter(_this, void 0, void 0, function () {
                                var prevItems, p, _i, prevItems_1, item;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            prevItems = this._items.map(function (v) { return v.id; });
                                            this._items = [];
                                            p = Promise.all(prevItems.map(function (id) {
                                                return new Promise(function (resolve) {
                                                    var d = _this.onItemDisposed(function (e) {
                                                        if (e === id) {
                                                            d.dispose();
                                                            resolve();
                                                        }
                                                    });
                                                });
                                            }));
                                            for (_i = 0, prevItems_1 = prevItems; _i < prevItems_1.length; _i++) {
                                                item = prevItems_1[_i];
                                                this._onDidChanged.fire({
                                                    type: "remove",
                                                    item: item,
                                                });
                                            }
                                            return [4 /*yield*/, p];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.notifyItemRendered = function (id) {
        this._onItemRendered.fire(id);
    };
    BranchListProvider.prototype.notifyItemDisposed = function (id) {
        this._onItemDisposed.fire(id);
    };
    BranchListProvider.prototype.awaitInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._initPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._initPromise];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BranchListProvider.prototype.waitRenderItems = function (newItems) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, newItems_1, item;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (item) {
                            var p;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = new Promise(function (resolve) {
                                            var d = _this.onItemRendered(function (e) {
                                                if (e === item) {
                                                    d.dispose();
                                                    resolve();
                                                }
                                            });
                                        });
                                        this_1._onDidChanged.fire({
                                            type: "add",
                                            item: item,
                                            barrier: new Barrier(),
                                        });
                                        return [4 /*yield*/, p];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, newItems_1 = newItems;
                        _a.label = 1;
                    case 1:
                        if (!(_i < newItems_1.length)) return [3 /*break*/, 4];
                        item = newItems_1[_i];
                        return [5 /*yield**/, _loop_1(item)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BranchListProvider;
}(Disposable));
export { BranchListProvider };
