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
    return this._waitingRenderItems;
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
      const itemsId = defaultItems.map((v) => v.id);
      this._sequencer.queue(async () => {
        await this.waitRenderItems(itemsId);
      });
    }

    // Collect not rendered item
    this._register(
      this.onDidChanged((e) => {
        if (e.type === 'add') {
          setTimeout(() => {
            if (!e.barrier.isOpen()) {
              this._waitingRenderItems.push({
                id: e.id,
                barrier: e.barrier,
              });
            }
          }, 0);
        }
      }),
    );
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
  popWaitingRenderItem(): IWaitingRenderItem | undefined {
    return this._waitingRenderItems.pop();
  }

  /**
   * Adds one or more items to the end of the list
   * @param items Items to be added
   * @returns Promise that resolves when the operation is complete
   */
  async push(...items: IBranchListItem<T>[]): Promise<void> {
    await this._sequencer.queue(async () => {
      this._items.push(...items);
      const newItems = items.map((v) => v.id);
      await this.waitRenderItems(newItems);
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

    await this._sequencer.queue(async () => {
      this._items.splice(index, 0, ...items);
      const newItems = items.map((v) => v.id);
      await this.waitRenderItems(newItems);

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

  /**
   * Waits for the specified items to be rendered
   * @param newItems Array of item IDs to wait for
   * @returns Promise that resolves when all items have been rendered
   */
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
        id: item,
        barrier: new Barrier(),
      });
      await p;
    }
  }
}
