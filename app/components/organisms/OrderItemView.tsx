import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { ItemAssign } from "./ItemAssign";

type props = {
  order: OrderEntity;
  setOrderItems: React.Dispatch<React.SetStateAction<WithId<ItemEntity>[]>>;
  inputStatus: "items" | "discount" | "received" | "description" | "submit";
  itemFocus: number;
  setItemFocus: React.Dispatch<React.SetStateAction<number>>;
  discountOrder: boolean;
};

// オーダーのアイテムや割引情報を表示するコンポーネント
const OrderItemView = ({
  inputStatus,
  discountOrder,
  setOrderItems,
  itemFocus,
  order,
}: props) => {
  return (
    <>
      {inputStatus === "items" && (
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
          setOrderItems={setOrderItems}
          focus={idx === itemFocus}
        />
      ))}
      {discountOrder && (
        <div className="grid grid-cols-2">
          <p className="font-bold text-lg">割引</p>
          <div>-&yen;{order.discountInfo.discount}</div>
        </div>
      )}
    </>
  );
};

export { OrderItemView };
