import { parseWithZod } from "@conform-to/zod";
import { type ClientActionFunction, useSubmit } from "@remix-run/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { stringToJSONSchema } from "~/lib/custom-zod";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, type2label } from "~/models/item";
import { OrderEntity, orderSchema } from "~/models/order";
import { orderRepository } from "~/repositories/order";

const keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];

export default function Cashier() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub({ converter: itemConverter }),
  );
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }),
  );
  const submit = useSubmit();
  const [orderItems, setOrderItems] = useState<WithId<ItemEntity>[]>([]);
  const [received, setReceived] = useState("");
  const [discountOrderId, setDiscountOrderId] = useState("");
  const [description, setDescription] = useState("");

  const discountOrderIdNum = Number(discountOrderId);
  const discountOrder = orders?.find(
    (order) => order.orderId === discountOrderIdNum,
  );
  const lastPurchasedCups = discountOrder?._getCoffeeCount() ?? 0;

  const curOrderId =
    orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 0;
  const nextOrderId = curOrderId + 1;
  const newOrder = OrderEntity.createNew({ orderId: nextOrderId });
  const receivedNum = Number(received);
  newOrder.items = orderItems;
  newOrder.received = receivedNum;
  if (discountOrder) {
    newOrder.applyDiscount(discountOrder);
  }
  const charge = newOrder.received - newOrder.billingAmount;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

  const submitOrder = () => {
    if (charge < 0) {
      return;
    }
    if (orderItems.length === 0) {
      return;
    }
    submit(
      { newOrder: JSON.stringify(newOrder.toOrder()) },
      { method: "POST" },
    );
    setOrderItems([]);
    setReceived("");
    setDiscountOrderId("");
  };

  useEffect(() => {
    items?.forEach((item, idx) => {
      const handler = (event: KeyboardEvent) => {
        const active = document.activeElement;
        if (active?.id === "description") {
          return;
        }
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
        setReceived("");
        setDiscountOrderId("");
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
            <p>{newOrder.billingAmount}</p>
          </div>
          <div>
            <p>割引券番号</p>
            <InputOTP
              maxLength={3}
              pattern={REGEXP_ONLY_DIGITS}
              value={discountOrderId}
              onChange={(value) => setDiscountOrderId(value)}
            >
              <InputOTPGroup />
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTP>
            <p>
              {discountOrder === undefined ? "見つかりません" : null}
              {discountOrder && `有効杯数: ${lastPurchasedCups}`}
            </p>
          </div>
          <Input
            type="number"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            placeholder="お預かり金額を入力"
          />
          <Input disabled value={chargeView} />
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="備考"
          />
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
          {discountOrder && (
            <div className="grid grid-cols-2">
              <p className="font-bold text-lg">割引</p>
              <div>-&yen;{newOrder.discountInfo.discount}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// TODO(toririm): リファクタリングするときにファイルを切り出す
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
  const order = OrderEntity.fromOrderWOId(newOrder);

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};
