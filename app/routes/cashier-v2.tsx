import { parseWithZod } from "@conform-to/zod";
import { useSubmit, type ClientActionFunction } from "@remix-run/react";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { stringToJSONSchema } from "~/lib/custom-zod";
import { type WithId } from "~/lib/typeguard";
import { type2label, type ItemEntity } from "~/models/item";
import { OrderEntity, orderSchema } from "~/models/order";
import { orderRepository } from "~/repositories/order";

const keys = [
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  ";",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  ",",
  ".",
  "/",
];

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

  const nextOrderId =
    (orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 1) + 1;
  const newOrder = OrderEntity.createNew({ orderId: nextOrderId });
  newOrder.items = orderItems;

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
      if (event.key === "Backspace") {
        setOrderItems((prevItems) => prevItems.slice(0, -1));
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
          <Button onClick={submitOrder}>提出</Button>
          <Button onClick={() => setOrderItems([])}>クリア</Button>
          <h1 className="text-lg">{`No. ${nextOrderId}`}</h1>
          <div className="border-8">
            <p>合計金額</p>
            <p>{newOrder.total}</p>
          </div>
          {orderItems.map((item, idx) => (
            <div key={`${idx}-${item.id}`}>
              <p>{item.name}</p>
              <p>{item.price}</p>
              <p>{type2label[item.type]}</p>
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
