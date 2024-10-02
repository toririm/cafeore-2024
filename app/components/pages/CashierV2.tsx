import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, type2label } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { useOrderState } from "../functional/useOrderState";
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

const latestOrderId = (orders: WithId<OrderEntity>[] | undefined): number => {
  if (!orders) {
    return 0;
  }
  return orders.reduce((acc, cur) => Math.max(acc, cur.orderId), 0);
};

const CashierV2 = ({ items, orders, submitPayload }: props) => {
  const [newOrder, newOrderDispatch] = useOrderState();
  const [inputStatus, setInputStatus] =
    useState<(typeof InputStatus)[number]>("discount");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputSession, setInputSession] = useState(new Date());

  const nextOrderId = useMemo(() => latestOrderId(orders) + 1, [orders]);
  useEffect(() => {
    newOrderDispatch({ type: "updateOrderId", orderId: nextOrderId });
  }, [nextOrderId, newOrderDispatch]);

  const charge = newOrder.received - newOrder.billingAmount;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

  const discountInputDOM = useRef<HTMLInputElement>(null);

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
      effectFn: () => setInputSession(new Date()),
    });
    submitPayload(newOrder);
  }, [charge, newOrder, submitPayload, newOrderDispatch]);

  const moveFocus = useCallback(() => {
    switch (inputStatus) {
      case "discount":
        setDialogOpen(false);
        discountInputDOM.current?.focus();
        break;
      case "items":
        break;
      case "received":
        break;
      case "description":
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
            key={`DiscountInput-${inputSession.toJSON()}`}
            ref={discountInputDOM}
            disabled={inputStatus !== "discount"}
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
            key={`Received-${inputSession.toJSON()}`}
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
            key={`Description-${inputSession.toJSON()}`}
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={newOrder}
        chargeView={chargeView}
        onConfirm={submitOrder}
      />
    </>
  );
};

export { CashierV2 };
