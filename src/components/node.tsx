import React from "react";
import { useBranchListContext } from "./context";

const RenderNode: React.FC<{ defaultItemId: string }> = ({ defaultItemId }) => {
  const [itemId, setItemId] = React.useState<string>(defaultItemId);
  const { provider, onRenderItem } = useBranchListContext();
  const divRef = React.useRef<HTMLDivElement>(null);
  const content = React.useMemo(() => {
    const item = provider.get(itemId);
    return item ? onRenderItem(item) : <div className="discarded-node" />;
  }, [itemId, onRenderItem, provider]);

  React.useEffect(() => {
    if (itemId) {
      provider.notifyItemRendered(itemId);
    }
  }, [itemId, provider]);

  React.useEffect(() => {
    return () => {
      if (itemId) {
        provider.notifyItemDisposed(itemId);
      }
    };
  }, [provider, itemId]);

  React.useEffect(() => {
    const d = provider.onDidChanged((e) => {
      if (e.type === "remove" && e.item === itemId) {
        setItemId("");
      }
    });

    return () => {
      d.dispose();
    };
  }, [itemId, provider]);
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
  }, [itemId, provider]);
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
      if (
        e.type === "add" &&
        currentId.current === null &&
        !e.barrier.isOpen()
      ) {
        d.dispose();
        currentId.current = e.item;
        setId(e.item);
        e.barrier.open();
      }
    });

    const toRenderItem = popToRenderItem();
    if (toRenderItem) {
      d.dispose();
      currentId.current = toRenderItem.id;
      setId(toRenderItem.id);
      toRenderItem.barrier.open();
    }

    return () => {
      d.dispose();
    };
  }, [popToRenderItem, provider]);
  return (
    <React.Fragment>{id && <BranchNode defaultItemId={id} />}</React.Fragment>
  );
};

export const BranchNode: React.FC<{ defaultItemId?: string }> = ({
  defaultItemId = undefined,
}) => {
  return (
    <React.Fragment>
      {defaultItemId && <RenderNode defaultItemId={defaultItemId} />}
      <ObserveNode />
    </React.Fragment>
  );
};
