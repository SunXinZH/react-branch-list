import { IBranchListProvider, IBranchListItem } from "./../common/types";
import { Barrier } from "vs-base-kits";

export interface IToRenderItem {
  id: string;
  barrier: Barrier;
}

export interface IBranchListContext<T extends object = {}> {
  provider: IBranchListProvider<T>;
  renderComponent: React.FunctionComponent<{ item: IBranchListItem<any> }>;
}

export interface IBranchListProps<T extends object = {}> {
  direction: "column" | "row";
  className?: string;
  provider?: IBranchListContext<T>["provider"];
  defaultItems?: IBranchListItem<T>[];
  renderComponent: IBranchListContext<T>["renderComponent"];
}
