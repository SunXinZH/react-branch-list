import React from "react";
import { useBranchListContext } from "./context";

const RenderNode: React.FC<{ itemId: string; onDisposed: ()=> void }> = ({ itemId, onDisposed }) => {
  const { provider, onRenderItem } = useBranchListContext();
  const divRef = React.useRef<HTMLDivElement>(null);
  const content = React.useMemo(() => {
    const item = provider.get(itemId);
    return item ? onRenderItem(item) : <div />;
  }, [itemId, onRenderItem]);

  React.useEffect(() => {
    if (itemId && content) {
      provider.notifyItemRendered(itemId);
    }
  }, [itemId, provider, content]);

  React.useEffect(() => {
    return () => {
      provider.notifyItemDisposed(itemId);
      onDisposed();
    };
  }, [provider, itemId, onDisposed]);

  React.useEffect(() => {
    const onUpdateOrder = (): void => {
      if (divRef.current) {
        if (itemId) {
          divRef.current.style.order = provider.indexOf(itemId).toString();
        } else {
          divRef.current.style.order = "";
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
  }, []);
  return (
    <div ref={divRef} className="branch-render-node">
      {content}
    </div>
  );
};
const ObserveNode: React.FC = () => {
  const { provider, popToRenderItem } = useBranchListContext();
  const currentId = React.useRef<string | null>(null);
  const [id, setId] = React.useState<string | null>(null);
  React.useEffect(() => {
    const d = provider.onDidChanged((e) => {
      if (e.type === "add" && currentId.current === null && !e.barrier.isOpen()) {
        currentId.current = e.item;
        setId(e.item);
        e.barrier.open();
      } else if (
        e.type === "remove" &&
        e.item === currentId.current
      ) {
        currentId.current = null;
        setId(null);
      }
    });

    const toRenderItem = popToRenderItem();
    if(toRenderItem){
        currentId.current = toRenderItem.id;
        setId(toRenderItem.id);
        toRenderItem.barrier.open();
    }

    return () => {
      d.dispose();
    };
  }, [provider]);
  return <React.Fragment>{id && <BranchNode defaultItemId={id} />}</React.Fragment>;
};


export const BranchNode: React.FC<{ defaultItemId?: string }> = ({ defaultItemId = undefined }) => {
    const [itemId, setItemId] = React.useState<string | undefined>(defaultItemId);
    const onDisposed = React.useCallback(() => {
        setItemId(undefined);
    },[]);
  return (
    <React.Fragment>
      {itemId && <RenderNode itemId={itemId} onDisposed={onDisposed}/>}
      <ObserveNode />
    </React.Fragment>
  );
}