import { IBranchListItem, IBranchListProvider, IChangeEvent, IWaitingRenderItem } from './types';

import { Disposable, Emitter, Event, Barrier, Sequencer } from 'vs-base-kits';

export class BranchListProvider<T extends object> extends Disposable implements IBranchListProvider<T> {
  private _items: IBranchListItem<T>[] = [];
  private _waitingRenderItems: IWaitingRenderItem[] = [];
  private _onDidChanged = this._register(new Emitter<IChangeEvent>());
  private _onPositionChanged = this._register(new Emitter<void>());
  private _onItemRendered = this._register(new Emitter<string>());
  private _onItemDisposed = this._register(new Emitter<string>());

  private _sequencer: Sequencer = new Sequencer();
  onDidChanged: Event<IChangeEvent> = this._onDidChanged.event;
  onPositionChanged: Event<void> = this._onPositionChanged.event;
  onItemRendered: Event<string> = this._onItemRendered.event;
  onItemDisposed: Event<string> = this._onItemDisposed.event;

  get items(): IBranchListItem<T>[] {
    return this._items;
  }

  get waitingRenderItems(): IWaitingRenderItem[] {
    return this._waitingRenderItems;
  }
  constructor(defaultItems: IBranchListItem<T>[] = []) {
    super();
    this._items = defaultItems;
    if (this.items.length > 0) {
      const itemsId = defaultItems.map((v) => v.id);
      this._sequencer.queue(async () => {
        await this.waitRenderItems(itemsId);
      });
    }
  }

  indexOf(id: string): number {
    return this._items.findIndex((v) => v.id === id);
  }

  get(id: string): IBranchListItem<T> | undefined {
    return this._items.find((v) => v.id === id);
  }

  popToRenderItem(): IWaitingRenderItem | undefined {
    return this._waitingRenderItems.pop();
  }
  async push(...items: IBranchListItem<T>[]): Promise<void> {
    await this._sequencer.queue(async () => {
      this._items.push(...items);
      const newItems = items.map((v) => v.id);
      await this.waitRenderItems(newItems);
    });
  }

  async insert(index: number, ...items: IBranchListItem<T>[]): Promise<void> {
    if (index < 0) {
      return;
    }

    await this._sequencer.queue(async () => {
      this._items.splice(index, 0, ...items);
      const newItems = items.map((v) => v.id);
      await this.waitRenderItems(newItems);

      this._onPositionChanged.fire();
    });
  }

  async remove(id: string): Promise<void> {
    await this._sequencer.queue(async () => {
      const index = this._items.findIndex((item) => item.id === id);
      if (index !== -1) {
        const p = new Promise<void>((resolve) => {
          const d = this.onItemDisposed((e) => {
            if (e === id) {
              d.dispose();
              resolve();
            }
          });
        });
        this._items.splice(index, 1);
        this._onDidChanged.fire({
          type: 'remove',
          item: id,
        });
        this._onPositionChanged.fire();
        await p;
      }
    });
  }

  async move(id: string, index: number): Promise<void> {
    await this._sequencer.queue(async () => {
      const currentIndex = this._items.findIndex((item) => item.id === id);
      if (currentIndex !== -1) {
        const item = this._items.splice(currentIndex, 1)[0];
        this._items.splice(index, 0, item);
        this._onPositionChanged.fire();
      }
    });
  }

  async clear(): Promise<void> {
    await this._sequencer.queue(async () => {
      const prevItems = this._items.map((v) => v.id);
      this._items = [];

      const p = Promise.all(
        prevItems.map((id) => {
          return new Promise<void>((resolve) => {
            const d = this.onItemDisposed((e) => {
              if (e === id) {
                d.dispose();
                resolve();
              }
            });
          });
        }),
      );

      for (const item of prevItems) {
        this._onDidChanged.fire({
          type: 'remove',
          item,
        });
      }

      await p;
    });
  }

  notifyItemRendered(id: string): void {
    this._onItemRendered.fire(id);
  }
  notifyItemDisposed(id: string): void {
    this._onItemDisposed.fire(id);
  }

  private async waitRenderItems(newItems: string[]): Promise<void> {
    for (const item of newItems) {
      const p = new Promise<void>((resolve) => {
        const d = this.onItemRendered((e) => {
          if (e === item) {
            d.dispose();
            resolve();
          }
        });
      });
      this._onDidChanged.fire({
        type: 'add',
        item,
        barrier: new Barrier(),
      });
      await p;
    }
  }
}
