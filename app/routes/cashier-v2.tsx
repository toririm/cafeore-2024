import { parseWithZod } from "@conform-to/zod";
import { type ClientActionFunction, useSubmit } from "@remix-run/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { ItemAssign } from "~/components/organisms/ItemAssign";
import { OrderAlertDialog } from "~/components/organisms/OrderAlertDialog";
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

const InputStatus = [
  "discount",
  "items",
  "received",
  "description",
  "submit",
] as const;

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
  const [inputStatus, setInputStatus] =
    useState<(typeof InputStatus)[number]>("discount");
  const [DialogOpen, setDialogOpen] = useState(false);
  const [itemFocus, setItemFocus] = useState<number>(0);

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
  if (description !== "") {
    newOrder.description = description;
  }
  if (discountOrder) {
    newOrder.applyDiscount(discountOrder);
  }
  const charge = newOrder.received - newOrder.billingAmount;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

  const receivedDOM = useRef<HTMLInputElement>(null);
  const descriptionDOM = useRef<HTMLInputElement>(null);

  const proceedItemFocus = useCallback(() => {
    setItemFocus((prev) => (prev + 1) % orderItems.length);
  }, [orderItems]);

  const prevousItemFocus = useCallback(() => {
    setItemFocus((prev) => (prev - 1 + orderItems.length) % orderItems.length);
  }, [orderItems]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (inputStatus !== "items") {
        return;
      }
      if (event.key === "ArrowUp") {
        prevousItemFocus();
      }
      if (event.key === "ArrowDown") {
        proceedItemFocus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [proceedItemFocus, prevousItemFocus, inputStatus]);

  const proceedStatus = useCallback(() => {
    const idx = InputStatus.indexOf(inputStatus);
    setInputStatus(InputStatus[(idx + 1) % InputStatus.length]);
  }, [inputStatus]);

  const prevousStatus = useCallback(() => {
    const idx = InputStatus.indexOf(inputStatus);
    setInputStatus(
      InputStatus[(idx - 1 + InputStatus.length) % InputStatus.length],
    );
  }, [inputStatus]);

  const submitOrder = useCallback(() => {
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
    setDescription("");
    setInputStatus("discount");
  }, [charge, newOrder, orderItems, submit]);

  const moveFocus = useCallback(() => {
    switch (inputStatus) {
      case "discount":
        setDialogOpen(false);
        document.getElementById("discountOrderId")?.focus();
        setItemFocus(-1);
        break;
      case "items":
        break;
      case "received":
        setItemFocus(-1);
        receivedDOM.current?.focus();
        break;
      case "description":
        descriptionDOM.current?.focus();
        setDialogOpen(false);
        break;
      case "submit":
        setDialogOpen(true);
        break;
    }
  }, [inputStatus]);

  useEffect(moveFocus);

  const keyEventHandlers = useMemo(() => {
    return {
      ArrowRight: proceedStatus,
      ArrowLeft: prevousStatus,
      Escape: () => {
        setInputStatus("discount");
        setDialogOpen(false);
        setOrderItems([]);
        setReceived("");
        setDiscountOrderId("");
        setDescription("");
      },
    };
  }, [proceedStatus, prevousStatus]);

  useEffect(() => {
    const handlers = items?.map((item, idx) => {
      const handler = (event: KeyboardEvent) => {
        if (inputStatus !== "items") {
          return;
        }
        if (event.key === keys[idx]) {
          setOrderItems((prevItems) => [...prevItems, structuredClone(item)]);
        }
      };
      return handler;
    });
    for (const handler of handlers ?? []) {
      window.addEventListener("keydown", handler);
    }

    return () => {
      for (const handler of handlers ?? []) {
        window.removeEventListener("keydown", handler);
      }
    };
  }, [items, inputStatus]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key;
      for (const [keyName, keyHandler] of Object.entries(keyEventHandlers)) {
        if (key === keyName) {
          keyHandler();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [keyEventHandlers]);

  return (
    <>
      <div className="grid grid-cols-3">
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
          <p>入力ステータスを移動して一つ一つの項目を入力していきます</p>
          <ul>
            <li>入力ステータスを移動　←・→</li>
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
              id="discountOrderId"
              maxLength={3}
              pattern={REGEXP_ONLY_DIGITS}
              value={discountOrderId}
              onChange={(value) => setDiscountOrderId(value)}
              disabled={inputStatus !== "discount"}
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
            disabled={inputStatus !== "received"}
            ref={receivedDOM}
          />
          <Input disabled value={chargeView} />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="備考"
            disabled={inputStatus !== "description"}
            ref={descriptionDOM}
          />
        </div>
        <div>
          <p>入力ステータス: {inputStatus}</p>
          {inputStatus === "items" && (
            <>
              <p>商品を追加: キーボードの a, s, d, f, g, h, j, k, l, ;</p>
              <p>↑・↓でアイテムのフォーカスを移動</p>
              <p>Enterで指名の入力欄を開く</p>
            </>
          )}
          {orderItems.map((item, idx) => (
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
              <div>-&yen;{newOrder.discountInfo.discount}</div>
            </div>
          )}
        </div>
      </div>
      <OrderAlertDialog
        open
        onOpenChange={setDialogOpen}
        order={newOrder}
        chargeView={chargeView}
        onSubmit={submitOrder}
      />
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
