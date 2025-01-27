import { IDisposable, Event, Barrier } from "vs-base-kits";

export type IBranchListItem<T extends object = {}> = { id: string } & T;

interface IAddEvent {
  readonly type: "add";
  readonly item: string;
  readonly barrier: Barrier;
}
interface IRemoveEvent {
  readonly type: "remove";
  readonly item: string;
}
export type IChangeEvent = IAddEvent | IRemoveEvent;

export interface IBranchListProvider<T extends object = {}>
  extends IDisposable {
  readonly onDidChanged: Event<IChangeEvent>;
  readonly onItemRendered: Event<string>;
  readonly onItemDisposed: Event<string>;
  readonly onPositionChanged: Event<void>;
  readonly items: IBranchListItem<T>[];

  push(...items: IBranchListItem<T>[]): Promise<void>;
  insert(index: number, ...items: IBranchListItem<T>[]): Promise<void>;
  remove(id: string): Promise<void>;
  move(id: string, index: number): Promise<void>;
  clear(): Promise<void>;
  indexOf(id: string): number;
  get(id: string): IBranchListItem<T> | undefined;

  notifyItemRendered(id: string): void;
  notifyItemDisposed(id: string): void;
}
