import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, type2label } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { useLatestOrderId } from "../functional/useLatestOrderId";
import { useOrderState } from "../functional/useOrderState";
import { useUISession } from "../functional/useUISession";
import { AttractiveTextBox } from "../molecules/AttractiveTextBox";
import { DiscountInput } from "../organisms/DiscountInput";
import { OrderAlertDialog } from "../organisms/OrderAlertDialog";
import { OrderItemView } from "../organisms/OrderItemView";
import { Button } from "../ui/button";

const InputStatus = [
  "discount",
  "items",
  "received",
  "description",
  "submit",
] as const;

type props = {
  items: WithId<ItemEntity>[] | undefined;
  orders: WithId<OrderEntity>[] | undefined;
  submitPayload: (order: OrderEntity) => void;
};

const CashierV2 = ({ items, orders, submitPayload }: props) => {
  const [newOrder, newOrderDispatch] = useOrderState();
  const [inputStatus, setInputStatus] =
    useState<(typeof InputStatus)[number]>("discount");
  const [UISession, renewUISession] = useUISession();
  const { nextOrderId } = useLatestOrderId(orders);

  useEffect(() => {
    newOrderDispatch({ type: "updateOrderId", orderId: nextOrderId });
  }, [nextOrderId, newOrderDispatch]);

  const charge = newOrder.received - newOrder.billingAmount;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

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
    if (newOrder.items.length === 0) {
      return;
    }
    newOrderDispatch({
      type: "clear",
      effectFn: renewUISession,
    });
    submitPayload(newOrder);
  }, [charge, newOrder, submitPayload, newOrderDispatch, renewUISession]);

  const keyEventHandlers = useMemo(() => {
    return {
      ArrowRight: proceedStatus,
      ArrowLeft: prevousStatus,
      Escape: () => {
        setInputStatus("discount");
        newOrderDispatch({ type: "clear" });
      },
    };
  }, [proceedStatus, prevousStatus, newOrderDispatch]);

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
          <h1 className="text-lg">{`No. ${newOrder.orderId}`}</h1>
          <div className="border-8">
            <p>合計金額</p>
            <p>{newOrder.billingAmount}</p>
          </div>
          <DiscountInput
            key={`DiscountInput-${UISession.key}`}
            focus={inputStatus === "discount"}
            orders={orders}
            onDiscountOrderFind={useCallback(
              (discountOrder) =>
                newOrderDispatch({ type: "applyDiscount", discountOrder }),
              [newOrderDispatch],
            )}
            onDiscountOrderRemoved={useCallback(
              () => newOrderDispatch({ type: "removeDiscount" }),
              [newOrderDispatch],
            )}
          />
          <AttractiveTextBox
            key={`Received-${UISession.key}`}
            type="number"
            onTextSet={useCallback(
              (text) =>
                newOrderDispatch({ type: "setReceived", received: text }),
              [newOrderDispatch],
            )}
            focus={inputStatus === "received"}
          />
          <Input disabled value={chargeView} />
          <AttractiveTextBox
            key={`Description-${UISession.key}`}
            onTextSet={useCallback(
              (text) =>
                newOrderDispatch({ type: "setDescription", description: text }),
              [newOrderDispatch],
            )}
            focus={inputStatus === "description"}
          />
        </div>
        <div>
          <p>入力ステータス: {inputStatus}</p>
          <OrderItemView
            items={items}
            order={newOrder}
            onAddItem={useCallback(
              (item) => newOrderDispatch({ type: "addItem", item }),
              [newOrderDispatch],
            )}
            mutateItem={useCallback(
              (idx, action) =>
                newOrderDispatch({ type: "mutateItem", idx, action }),
              [newOrderDispatch],
            )}
            focus={inputStatus === "items"}
            discountOrder={useMemo(
              () => newOrder.discountOrderId !== null,
              [newOrder],
            )}
          />
        </div>
      </div>
      <OrderAlertDialog
        open={inputStatus === "submit"}
        order={newOrder}
        chargeView={chargeView}
        onConfirm={submitOrder}
        onCanceled={useCallback(() => setInputStatus("description"), [])}
      />
    </>
  );
};

export { CashierV2 };
