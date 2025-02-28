import { IDisposable, Event, Barrier } from 'vs-base-kits';

/**
 * Represents a generic list item with an ID and additional properties of type T.
 * This type can be extended with additional properties based on the implementation needs.
 *
 * @type T The type of the additional properties that can be added to the item
 */
export type IBranchListItem<T extends object = object> = {
  /** Unique identifier for the item */
  id: string;
} & T;

/**
 * Event type representing an 'add' operation
 */
interface IAddEvent {
  /** Type identifier for the event */
  readonly type: 'add';
  /** ID of the item being added */
  readonly id: string;
  /** Barrier associated with the add operation */
  readonly barrier: Barrier;
}

/**
 * Event type representing a 'remove' operation
 */
interface IRemoveEvent {
  /** Type identifier for the event */
  readonly type: 'remove';
  /** ID of the item being removed */
  readonly id: string;
}

/**
 * Union type representing all possible change events (add or remove)
 */
export type IChangeEvent = IAddEvent | IRemoveEvent;

/**
 * Represents an item waiting to be rendered
 */
export interface IWaitingRenderItem {
  /** Unique identifier for the item */
  id: string;
  /** Barrier associated with the rendering process */
  barrier: Barrier;
}

/**
 * Interface for a controller that manages a list of branch items
 *
 * @type T Type of the additional properties in the list items
 */
export interface IBranchListController<T extends object = object> extends IDisposable {
  /** Array of items in the list */
  readonly items: IBranchListItem<T>[];

  /**
   * Adds one or more items to the end of the list
   * @param items Items to be added
   * @returns Promise that resolves when the operation is complete
   */
  push(...items: IBranchListItem<T>[]): Promise<void>;

  /**
   * Inserts one or more items at a specified index in the list
   * @param index The position where items should be inserted
   * @param items Items to be inserted
   * @returns Promise that resolves when the operation is complete
   */
  insert(index: number, ...items: IBranchListItem<T>[]): Promise<void>;

  /**
   * Removes an item from the list by its ID
   * @param id ID of the item to remove
   * @returns Promise that resolves when the removal is complete
   */
  remove(id: string): Promise<void>;

  /**
   * Moves an item to a new position in the list
   * @param id ID of the item to move
   * @param index The new position for the item
   * @returns Promise that resolves when the operation is complete
   */
  move(id: string, index: number): Promise<void>;

  /**
   * Clears all items from the list
   * @returns Promise that resolves when the list is cleared
   */
  clear(): Promise<void>;

  /**
   * Finds the index of an item by its ID
   * @param id ID of the item to find
   * @returns The index of the item, or -1 if not found
   */
  indexOf(id: string): number;

  /**
   * Retrieves an item by its ID
   * @param id ID of the item to retrieve
   * @returns The item if found, undefined otherwise
   */
  get(id: string): IBranchListItem<T> | undefined;
}

/**
 * Interface for a provider that manages a list of branch items with additional rendering capabilities
 *
 * @type T Type of the additional properties in the list items
 */
export interface IBranchListProvider<T extends object = object> extends IBranchListController<T> {
  /** Array of items waiting to be rendered */
  readonly waitingRenderItems: IWaitingRenderItem[];

  /** Event fired when changes (add/remove) occur in the list */
  readonly onDidChanged: Event<IChangeEvent>;

  /** Event fired when an item has been rendered */
  readonly onItemRendered: Event<string>;

  /** Event fired when an item is disposed */
  readonly onItemDisposed: Event<string>;

  /** Event fired when the position of items changes */
  readonly onPositionChanged: Event<void>;

  /**
   * Notifies that an item has been rendered
   * @param id ID of the item that was rendered
   */
  notifyItemRendered(id: string): void;

  /**
   * Notifies that an item has been disposed
   * @param id ID of the item that was disposed
   */
  notifyItemDisposed(id: string): void;

  /**
   * Retrieves the next item waiting to be rendered
   * @returns The next waiting render item, or undefined if none are waiting
   */
  popWaitingRenderItem(): IWaitingRenderItem | undefined;
}
