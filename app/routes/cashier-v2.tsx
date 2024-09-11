import { parseWithZod } from "@conform-to/zod";
import { useSubmit, type ClientActionFunction } from "@remix-run/react";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { stringToJSONSchema } from "~/lib/custom-zod";
import { type WithId } from "~/lib/typeguard";
import { type2label, type ItemEntity } from "~/models/item";
import { OrderEntity, orderSchema } from "~/models/order";
import { orderRepository } from "~/repositories/order";

const keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];

export default function Cashier() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub(itemConverter),
  );
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub(orderConverter),
  );
  const [orderItems, setOrderItems] = useState<WithId<ItemEntity>[]>([]);
  const submit = useSubmit();
  console.log("orders", orders);

  const curOrderId =
    orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 0;
  const nextOrderId = curOrderId + 1;
  const newOrder = OrderEntity.createNew({ orderId: nextOrderId });
  newOrder.items = orderItems;
  const [received, setReceived] = useState("");
  const charge = Number(received) - newOrder.total;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

  const submitOrder = () => {
    if (orderItems.length === 0) {
      return;
    }
    submit(
      { newOrder: JSON.stringify(newOrder.toOrder()) },
      { method: "POST" },
    );
    setOrderItems([]);
  };

  useEffect(() => {
    items?.forEach((item, idx) => {
      const handler = (event: KeyboardEvent) => {
        if (event.key === keys[idx]) {
          setOrderItems((prevItems) => [...prevItems, item]);
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    });
  }, [items]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        submitOrder();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOrderItems([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <>
      <div className="grid grid-cols-2">
        <div>
          {items?.map((item) => (
            <div key={item.id}>
              <p>{item.name}</p>
              <p>{item.price}</p>
              <p>{type2label[item.type]}</p>
              <Button
                onClick={() => {
                  setOrderItems((prevItems) => [...prevItems, item]);
                }}
              >
                追加
              </Button>
            </div>
          ))}
        </div>
        <div>
          <p>操作</p>
          <p>
            お預かり金額入力欄にフォーカスを合わせたまま商品の追加やクリアができます
          </p>
          <ul>
            <li>商品を追加: キーボードの a, s, d, f, g, h, j, k, l, ;</li>
            <li>注文を提出: Enter</li>
            <li>注文をクリア: Esc</li>
          </ul>
          <Button onClick={submitOrder}>提出</Button>
          <Button onClick={() => setOrderItems([])}>クリア</Button>
          <h1 className="text-lg">{`No. ${nextOrderId}`}</h1>
          <div className="border-8">
            <p>合計金額</p>
            <p>{newOrder.total}</p>
          </div>
          <Input
            type="number"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            placeholder="お預かり金額を入力"
          />
          <Input disabled value={chargeView} />
          {orderItems.map((item, idx) => (
            <div key={`${idx}-${item.id}`} className="grid grid-cols-2">
              <p className="font-bold text-lg">{idx + 1}</p>
              <div>
                <p>{item.name}</p>
                <p>{item.price}</p>
                <p>{type2label[item.type]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const schema = z.object({
    newOrder: stringToJSONSchema.pipe(orderSchema),
  });
  const submission = parseWithZod(formData, {
    schema,
  });
  if (submission.status !== "success") {
    console.error(submission.error);
    return submission.reply();
  }

  const { newOrder } = submission.value;
  const order = OrderEntity.createNew({ orderId: newOrder.orderId });
  order.items = newOrder.items;

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};
