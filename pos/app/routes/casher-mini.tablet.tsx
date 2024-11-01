import { itemSource } from "common/data/items";
import { orderConverter } from "common/firebase-utils/converter";
import { collectionSub } from "common/firebase-utils/subscription";
import useSWRSubscription from "swr/subscription";

export default function CasherMini() {
  const items = itemSource;
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }),
  );
  const curOrderId =
    orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 0;
  const nextOrderId = curOrderId + 1;
  const order = orders ? orders[curOrderId] : undefined;

  return (
    <div className="flex h-full p-[20px]">
      <div>No. {nextOrderId}</div>
      <div>商品点数： {order ? order.items.length : 0} 点</div>
      <div>小計： {order ? order.total : 0} 円</div>
      <div>割引： {order ? order.discount : 0} 円</div>
      <div>合計： {order ? order.billingAmount : 0} 円</div>
      <div>お預り： {order ? order.received : 0} 円</div>
      <div>
        お釣り： {(order?.received ?? 0) - (order?.billingAmount ?? 0)} 円
      </div>
    </div>
  );
}
