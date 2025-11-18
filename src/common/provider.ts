import { IBranchListItem, IBranchListProvider, IChangeEvent, IWaitingRenderItem } from './types';
import { Disposable, Emitter, Event, Barrier, Sequencer } from 'vs-base-kits';

/**
 * Class that provides functionality for managing a list of branch items
 * with support for rendering and disposal notifications.
 *
 * @type T The type of the additional properties in the list items
 */
export class BranchListProvider<T extends object> extends Disposable implements IBranchListProvider<T> {
  /** The list of branch items being managed */
  private _items: IBranchListItem<T>[] = [];

  /** Items waiting to be rendered */
  private _waitingRenderItems: IWaitingRenderItem[] = [];

  /** Event emitter for change events */
  private _onDidChanged = this._register(new Emitter<IChangeEvent>());

  /** Event emitter for position changes */
  private _onPositionChanged = this._register(new Emitter<void>());

  /** Event emitter for item rendering notifications */
  private _onItemRendered = this._register(new Emitter<string>());

  /** Event emitter for item disposal notifications */
  private _onItemDisposed = this._register(new Emitter<string>());

  /** Sequencer for managing asynchronous operations */
  private _sequencer: Sequencer = new Sequencer();

  /** Exposes the change event to the public API */
  onDidChanged: Event<IChangeEvent> = this._onDidChanged.event;

  /** Exposes the position change event to the public API */
  onPositionChanged: Event<void> = this._onPositionChanged.event;

  /** Exposes the item rendered event to the public API */
  onItemRendered: Event<string> = this._onItemRendered.event;

  /** Exposes the item disposed event to the public API */
  onItemDisposed: Event<string> = this._onItemDisposed.event;

  /**
   * Gets the list of managed branch items
   */
  get items(): IBranchListItem<T>[] {
    return this._items;
  }

  /**
   * Gets the list of items waiting to be rendered
   */
  get waitingRenderItems(): IWaitingRenderItem[] {
    return [...this._waitingRenderItems];
  }

  /**
   * Constructs a new BranchListProvider instance
   * @param defaultItems Initial items to populate the list with (optional)
   */
  constructor(defaultItems: IBranchListItem<T>[] = []) {
    super();
    this._items = defaultItems;

    // Initialize rendering queue if default items are provided
    if (this.items.length > 0) {
      this._sequencer.queue(async () => {
        const newItems = this.items.map((v)=> v.id);
        await this.doRenderItems(newItems);
        this._onPositionChanged.fire();
      });
    }
  }

  /**
   * Finds the index of an item by its ID
   * @param id The ID of the item to find
   * @returns The index of the item, or -1 if not found
   */
  indexOf(id: string): number {
    return this._items.findIndex((v) => v.id === id);
  }

  /**
   * Retrieves an item by its ID
   * @param id The ID of the item to retrieve
   * @returns The item if found, undefined otherwise
   */
  get(id: string): IBranchListItem<T> | undefined {
    return this._items.find((v) => v.id === id);
  }

  /**
   * Retrieves and removes the next item waiting to be rendered
   * @returns The next waiting render item, or undefined if none are waiting
   */
  popWaitingRenderItemId(): string | undefined {
    return this._waitingRenderItems[0]?.id;
  }

  /**
   * Release the item from the waiting list
   * @param id ID of the waiting item 
   */
  releaseWaitingRenderItem(...id: string[]): void {
    for(const i of id){
      const index = this._waitingRenderItems.findIndex((v)=> v.id === i);
      if(index >= 0){
        const item = this._waitingRenderItems[index];
        item.barrier.open();
        this._waitingRenderItems.splice(index, 1);
      }
    }
  }
  /**
   * Adds one or more items to the end of the list
   * @param items Items to be added
   * @returns Promise that resolves when the operation is complete
   */
  async push(...items: IBranchListItem<T>[]): Promise<void> {
    const copiedItems = items.map((v)=> JSON.parse(JSON.stringify(v)));
    await this._sequencer.queue(async () => {
      this._items.push(...copiedItems);
      const newItems = copiedItems.map((v) => v.id);
      await this.doRenderItems(newItems);
      this._onPositionChanged.fire();
    });
  }

  /**
   * Inserts one or more items at a specified index in the list
   * @param index The position where items should be inserted
   * @param items Items to be inserted
   * @returns Promise that resolves when the operation is complete
   */
  async insert(index: number, ...items: IBranchListItem<T>[]): Promise<void> {
    if (index < 0) {
      return;
    }
    const copiedItems = items.map((v)=> JSON.parse(JSON.stringify(v)));
    await this._sequencer.queue(async () => {
      this._items.splice(index, 0, ...copiedItems);
      const newItems = copiedItems.map((v) => v.id);
      await this.doRenderItems(newItems);
      this._onPositionChanged.fire();
    });
  }

  /**
   * Removes an item from the list by its ID
   * @param id ID of the item to remove
   * @returns Promise that resolves when the removal is complete
   */
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
          id: id,
        });
        this._onPositionChanged.fire();
        await p;
      }
    });
  }

  /**
   * Moves an item to a new position in the list
   * @param id ID of the item to move
   * @param index The new position for the item
   * @returns Promise that resolves when the operation is complete
   */
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

  /**
   * Clears all items from the list
   * @returns Promise that resolves when the list is cleared
   */
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
          id: item,
        });
      }

      await p;
    });
  }

  /**
   * fNotifies that items have been flushed, all items need to rerender
   */
  async flush(): Promise<void> {
    for(const item of this._items){
      const e: IChangeEvent = {
        type:"add",
        id: item.id,
        barrier: new Barrier()
      }

      this._waitingRenderItems.push(e)
    }
  }
  /**
   * Notifies that an item has been rendered
   * @param id ID of the item that was rendered
   */
  notifyItemRendered(id: string): void {
    this._onItemRendered.fire(id);
  }

  /**
   * Notifies that an item has been disposed
   * @param id ID of the item that was disposed
   */
  notifyItemDisposed(id: string): void {
    this._onItemDisposed.fire(id);
  }

  private async doRenderItems(newItems: string[]): Promise<void>{
    for(const item of newItems){
      const p = new Promise<void>((resolve)=>{
        const d = this.onItemRendered((id)=>{
          if(id === item){
            d.dispose();
            resolve();
          }
        })
      })
      const e: IChangeEvent = {
        type: "add",
        id: item,
        barrier: new Barrier()
      }
      this._waitingRenderItems.push(e);
      this._onDidChanged.fire(e);
      await p;
    }
  }
}
