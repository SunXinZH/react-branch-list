import { IListItem, IListProvider, IChangeEvent} from "./types";

import { Disposable, IDisposable, Emitter, Event } from "sx-base-kits"


class ListProvider<T extends object> extends Disposable implements IListProvider<T>{
    private _items: IListItem<T>[] = []
    private _onDidChanged = this._register(new Emitter<IChangeEvent>());
    private _onPositionChanged = this._register(new Emitter<void>());

    private _onItemRendered = this._register(new Emitter<string>());
    private _onItemDisposed = this._register(new Emitter<string>());

    onDidChanged: Event<IChangeEvent> = this._onDidChanged.event;
    onPositionChanged: Event<void> = this._onPositionChanged.event;

    onItemRendered: Event<string> =  this._onItemRendered.event;
    onItemDisposed: Event<string> = this._onItemDisposed.event;

    get items(): IListItem<T>[] { return this._items; }

    async push(...items: IListItem<T>[]): Promise<void> {
        this._items.push(...items)
        const newItems = items.map((v)=> v.id);
        const p = Promise.all(newItems.map((id)=> {
            return new Promise<void>((resolve)=>{
                const d = this.onItemRendered((e)=>{
                    if(e ===id){
                        d.dispose()
                        resolve()
                    }
                })
            })
        }))

        this._onDidChanged.fire({
            type: 'add',
            items: newItems
        })

        await p;
    }

    async insert(index: number, ...items: IListItem<T>[]): Promise<void> {
        if(index < 0 ){
            return;
        }

        const newItems = items.map((v)=> v.id);
        const p = Promise.all(newItems.map((id)=> {
            return new Promise<void>((resolve)=>{
                const d = this.onItemRendered((e)=>{
                    if(e ===id){
                        d.dispose()
                        resolve()
                    }
                })
            })
        }))
        this._items.splice(index, 0, ...items);
        this._onDidChanged.fire({
            type: 'add',
            items: newItems
        })
        this._onPositionChanged.fire();
        await p;
    }

    async remove(id: string): Promise<void> {
        const index = this._items.findIndex(item => item.id === id)
        if (index !== -1) {
            const  p = new Promise<void>((resolve)=>{
                const d = this.onItemDisposed((e)=>{
                    if(e ===id){
                        d.dispose()
                        resolve()
                    }
                });
            });
            this._items.splice(index, 1)
            this._onDidChanged.fire({
                type: 'remove',
                items: [id]
            })
            await p;
        }
    }

    async move(id: string, index: number): Promise<void> {
        const currentIndex = this._items.findIndex(item => item.id === id)
        if (currentIndex !== -1) {
            const item = this._items.splice(currentIndex, 1)[0]
            this._items.splice(index, 0, item)
            this._onPositionChanged.fire();
        }
    }

    async clear(): Promise<void> {
        const prevItems = this._items.map((v)=> v.id)
        this._items = [];
        
        const p = Promise.all(prevItems.map((id)=> {
            return new Promise<void>((resolve)=>{
                const d = this.onItemDisposed((e)=>{
                    if(e ===id){
                        d.dispose()
                        resolve()
                    }
                })
            })
        }))

        this._onDidChanged.fire({
            type: 'remove',
            items: prevItems
        })

        await p
    }

    notifyItemRendered(id: string): void{
        this._onItemRendered.fire(id);
    }
    notifyItemDisposed(id: string): void{
        this._onItemDisposed.fire(id);
    }
}