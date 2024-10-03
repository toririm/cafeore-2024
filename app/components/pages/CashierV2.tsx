import { useCallback, useEffect, useMemo } from "react";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, type2label } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { useInputStatus } from "../functional/useInputStatus";
import { useLatestOrderId } from "../functional/useLatestOrderId";
import { useOrderState } from "../functional/useOrderState";
import { useUISession } from "../functional/useUISession";
import { AttractiveTextBox } from "../molecules/AttractiveTextBox";
import { InputNumber } from "../molecules/InputNumber";
import { ChargeView } from "../organisms/ChargeView";
import { DiscountInput } from "../organisms/DiscountInput";
import { OrderAlertDialog } from "../organisms/OrderAlertDialog";
import { OrderItemEdit } from "../organisms/OrderItemEdit";
import { Button } from "../ui/button";

type props = {
  items: WithId<ItemEntity>[] | undefined;
  orders: WithId<OrderEntity>[] | undefined;
  submitPayload: (order: OrderEntity) => void;
};

/**
 * キャッシャー画面のコンポーネント
 *
 * データの入出力は親コンポーネントに任せる
 */
const CashierV2 = ({ items, orders, submitPayload }: props) => {
  const [newOrder, newOrderDispatch] = useOrderState();
  const { inputStatus, proceedStatus, previousStatus, resetStatus } =
    useInputStatus();
  const [UISession, renewUISession] = useUISession();
  const { nextOrderId } = useLatestOrderId(orders);

  useEffect(() => {
    newOrderDispatch({ type: "updateOrderId", orderId: nextOrderId });
  }, [nextOrderId, newOrderDispatch]);

  const resetAll = useCallback(() => {
    newOrderDispatch({ type: "clear" });
    resetStatus();
    renewUISession();
  }, [newOrderDispatch, resetStatus, renewUISession]);

  const submitOrder = useCallback(() => {
    if (newOrder.getCharge() < 0) {
      return;
    }
    if (newOrder.items.length === 0) {
      return;
    }
    submitPayload(newOrder);
    resetAll();
  }, [newOrder, submitPayload, resetAll]);

  const keyEventHandlers = useMemo(() => {
    return {
      ArrowRight: proceedStatus,
      ArrowLeft: previousStatus,
      Escape: () => {
        resetAll();
      },
    };
  }, [proceedStatus, previousStatus, resetAll]);

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
          <InputNumber
            key={`Received-${UISession.key}`}
            onTextSet={useCallback(
              (text) =>
                newOrderDispatch({ type: "setReceived", received: text }),
              [newOrderDispatch],
            )}
            focus={inputStatus === "received"}
          />
          <ChargeView order={newOrder} />
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
          <OrderItemEdit
            items={items}
            order={newOrder}
            onAddItem={useCallback(
              (item) => newOrderDispatch({ type: "addItem", item }),
              [newOrderDispatch],
            )}
            onRemoveItem={useCallback(
              (idx) => newOrderDispatch({ type: "removeItem", idx }),
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
        onConfirm={submitOrder}
        onCanceled={previousStatus}
      />
    </>
  );
};

export { CashierV2 };
