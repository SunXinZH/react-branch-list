import { Disposable, IDisposable, Emitter, Event } from "sx-base-kits"

export type IListItem<T extends object>  = { id: string } & T

export interface IChangeEvent{
    readonly type: 'add' | 'remove' | 'update'
    readonly items: string[]
}

export interface IListProvider<T extends object> extends IDisposable{
    readonly onDidChanged: Event<IChangeEvent>;
    readonly onItemRendered: Event<string>;
    readonly onItemDisposed: Event<string>;
    readonly onPositionChanged: Event<void>;
    readonly items: IListItem<T>[];

    push(...items: IListItem<T>[]): Promise<void>;
    insert(index: number, ...items: IListItem<T>[]): Promise<void>;
    remove(id: string): Promise<void>;
    move(id: string, index: number): Promise<void>;
    clear(): Promise<void>;

    notifyItemRendered(id: string): void;
    notifyItemDisposed(id: string): void;
}   