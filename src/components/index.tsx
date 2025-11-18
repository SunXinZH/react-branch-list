import React from 'react';
import { IBranchListProvider, IBranchListController } from './../common/types';
import { BranchListProvider } from './../common/provider';

import { IBranchListContext, IBranchListProps } from './types';
import { BranchListContextProvider } from './context';
import { BranchNode } from './node';

export interface IBranchListRef<T extends object = object> {
  controller: IBranchListController<T>;
}

const _BranchList = <T extends object = object>(props: IBranchListProps<T>, ref: React.Ref<IBranchListRef<T>>) => {
  const [provider] = React.useState<IBranchListProvider<T>>(
    props.provider || new BranchListProvider<T>(props.defaultItems || []),
  );

  React.useImperativeHandle(
    ref,
    () => ({
      controller: provider,
    }),
    [provider],
  );

  const value = React.useMemo((): IBranchListContext<object> => {
    return {
      provider,
      renderComponent: props.renderComponent as unknown as IBranchListContext<object>['renderComponent'],
    };
  }, [props.renderComponent, provider]);
  React.useEffect(()=>{
    return ()=>{
      value.provider.flush();
    }
  },[value])
  return (
    <BranchListContextProvider value={value}>
      <div
        className={`branch-list-root ${props.className}`}
        style={{
          display: 'flex',
          flexDirection: props.direction,
        }}
      >
        <BranchNode />
      </div>
    </BranchListContextProvider>
  );
};

export const BranchList = React.forwardRef(_BranchList) as unknown as <T extends object>(
  props: IBranchListProps<T> & {
    ref?: React.Ref<IBranchListRef<T>>;
  },
) => React.ReactElement;
