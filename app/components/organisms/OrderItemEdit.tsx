import { useCallback, useEffect, useState } from "react";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { ItemAssign } from "./ItemAssign";

const keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];

type props = {
  order: OrderEntity;
  items: WithId<ItemEntity>[] | undefined;
  focus: boolean;
  onAddItem: (item: WithId<ItemEntity>) => void;
  mutateItem: (
    idx: number,
    action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>,
  ) => void;
  discountOrder: boolean;
};

// オーダーのアイテムや割引情報を表示するコンポーネント
const OrderItemEdit = ({
  focus,
  discountOrder,
  onAddItem,
  mutateItem,
  order,
  items,
}: props) => {
  const [itemFocus, setItemFocus] = useState<number>(-1);

  const proceedItemFocus = useCallback(() => {
    setItemFocus((prev) => (prev + 1) % order.items.length);
  }, [order.items]);

  const prevousItemFocus = useCallback(() => {
    setItemFocus(
      (prev) => (prev - 1 + order.items.length) % order.items.length,
    );
  }, [order.items]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          prevousItemFocus();
          break;
        case "ArrowDown":
          proceedItemFocus();
          break;
      }
    };
    if (focus) {
      window.addEventListener("keydown", handler);
    }
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [proceedItemFocus, prevousItemFocus, focus]);

  useEffect(() => {
    if (!items) return;
    const handler = (event: KeyboardEvent) => {
      for (const [idx, item] of items.entries()) {
        if (event.key === keys[idx]) {
          onAddItem(item);
        }
      }
    };
    if (focus) {
      window.addEventListener("keydown", handler);
    }
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [items, focus, onAddItem]);

  useEffect(() => {
    if (!focus) {
      setItemFocus(-1);
    }
  }, [focus]);

  return (
    <>
      {focus && (
        <>
          <p>商品を追加: キーボードの a, s, d, f, g, h, j, k, l, ;</p>
          <p>↑・↓でアイテムのフォーカスを移動</p>
          <p>Enterで指名の入力欄を開く</p>
        </>
      )}
      {order.items.map((item, idx) => (
        <ItemAssign
          key={`${idx}-${item.id}`}
          item={item}
          idx={idx}
          mutateItem={mutateItem}
          focus={idx === itemFocus}
        />
      ))}
      {discountOrder && (
        <div className="grid grid-cols-2">
          <p className="font-bold text-lg">割引</p>
          <div>-&yen;{order.discount}</div>
        </div>
      )}
    </>
  );
};

export { OrderItemEdit };
