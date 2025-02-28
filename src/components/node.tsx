import React from 'react';
import { useBranchListContext } from './context';

/**
 * Renders a single node in the branch list
 */
const RenderNode: React.FC<{ defaultItemId: string }> = ({ defaultItemId }) => {
  // Initialize state for the current item ID
  const [itemId, setItemId] = React.useState<string>(defaultItemId);

  // Get context values
  const { provider, renderComponent: Component } = useBranchListContext();

  // Reference to the DOM element
  const divRef = React.useRef<HTMLDivElement>(null);

  /**
   * Memoized content to avoid unnecessary re-renders
   * Renders the component if the item exists, otherwise shows a placeholder
   */
  const content = React.useMemo(() => {
    const item = provider.get(itemId);
    return item ? <Component {...item} /> : <div className="discarded-node" />;
  }, [Component, itemId, provider]);

  // Notify provider when the item is rendered
  React.useEffect(() => {
    if (itemId) {
      provider.notifyItemRendered(itemId);
    }
  }, [itemId, provider]);

  // Cleanup effect to notify provider when the item is disposed
  React.useEffect(() => {
    return () => {
      if (itemId) {
        provider.notifyItemDisposed(itemId);
      }
    };
  }, [provider, itemId]);

  // Listen for item changes and update itemId accordingly
  React.useEffect(() => {
    const d = provider.onDidChanged((e) => {
      if (e.type === 'remove' && e.id === itemId) {
        setItemId('');
      }
    });

    return () => {
      d.dispose();
    };
  }, [itemId, provider]);

  // Update the node's order in the UI based on provider's position
  React.useEffect(() => {
    const onUpdateOrder = (): void => {
      if (divRef.current) {
        if (itemId) {
          divRef.current.style.order = provider.indexOf(itemId).toString();
        } else {
          divRef.current.style.order = '';
        }
      }
    };

    const d = provider.onPositionChanged(() => {
      onUpdateOrder();
    });
    onUpdateOrder();

    return () => {
      d.dispose();
    };
  }, [itemId, provider]);

  return (
    <div ref={divRef} className="branch-render-node">
      {content}
    </div>
  );
};

/**
 * Observes and renders new nodes as they are added
 */
const ObserveNode: React.FC = () => {
  const { provider } = useBranchListContext();
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isRendered: boolean = false;
    const d = provider.onDidChanged((e) => {
      if (e.type === 'add' && isRendered === false && !e.barrier.isOpen()) {
        d.dispose();
        isRendered = true;
        setId(e.id);
        e.barrier.open();
      }
    });

    const toRenderItem = provider.popWaitingRenderItem();
    if (toRenderItem) {
      d.dispose();
      isRendered = true;
      setId(toRenderItem.id);
      toRenderItem.barrier.open();
    }

    return () => {
      d.dispose();
    };
  }, [provider]);

  return <React.Fragment>{id && <BranchNode defaultItemId={id} />}</React.Fragment>;
};

/**
 * Main BranchNode component that composes RenderNode and ObserveNode
 */
export const BranchNode: React.FC<{ defaultItemId?: string }> = ({ defaultItemId = undefined }) => {
  return (
    <React.Fragment>
      {defaultItemId && <RenderNode defaultItemId={defaultItemId} />}
      <ObserveNode />
    </React.Fragment>
  );
};
