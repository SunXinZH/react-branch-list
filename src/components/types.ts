import { IBranchListProvider, IBranchListItem } from "./../common/types"
import { Barrier } from 'vsc-base-kits';

export interface IToRenderItem{
    id: string;
    barrier: Barrier;
}

export interface IBranchListContext<T extends object> {
    provider: IBranchListProvider<T>;
    popToRenderItem: ()=> IToRenderItem | undefined;
    onRenderItem: (item: IBranchListItem<T>) => React.ReactElement;
}

export interface IBranchListProps<T extends object> {
    direction: "column" | "row";
    className?: string;
    provider?: IBranchListContext<T>["provider"];
    defaultItems?: IBranchListItem<T>[];
    onRenderItem: IBranchListContext<T>["onRenderItem"];
}
