import { IBranchListProvider, IBranchListItem } from './../common/types';

export interface IBranchListContext<T extends object = object> {
  provider: IBranchListProvider<T>;
  renderComponent: React.FunctionComponent<IBranchListItem<object>>;
}

export interface IBranchListProps<T extends object = object> {
  direction: 'column' | 'row';
  className?: string;
  provider?: IBranchListContext<T>['provider'];
  defaultItems?: IBranchListItem<T>[];
  renderComponent: IBranchListContext<T>['renderComponent'];
}
