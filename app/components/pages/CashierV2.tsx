import { useCallback, useEffect, useMemo } from "react";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { useInputStatus } from "../functional/useInputStatus";
import { useLatestOrderId } from "../functional/useLatestOrderId";
import { useOrderState } from "../functional/useOrderState";
import { usePreventNumberKeyUpDown } from "../functional/usePreventNumberKeyUpDown";
import { useUISession } from "../functional/useUISession";
import { AttractiveTextBox } from "../molecules/AttractiveTextBox";
import { InputHeader } from "../molecules/InputHeader";
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
  usePreventNumberKeyUpDown();

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
      <div className="p-4">
        <p className="font-extrabold text-3xl">No.{newOrder.orderId}</p>
        <div className="flex gap-5 px-2">
          <div className="flex-1">
            <InputHeader
              title="商品"
              focus={inputStatus === "items"}
              number={1}
            />
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
          <div className="flex-1">
            <InputHeader
              title="割引"
              focus={inputStatus === "discount"}
              number={2}
            />
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
          </div>
          <div className="flex-1">
            <InputHeader
              title="備考"
              focus={inputStatus === "description"}
              number={3}
            />
            <AttractiveTextBox
              key={`Description-${UISession.key}`}
              onTextSet={useCallback(
                (text) =>
                  newOrderDispatch({
                    type: "setDescription",
                    description: text,
                  }),
                [newOrderDispatch],
              )}
              focus={inputStatus === "description"}
            />
          </div>
          <div className="flex-1">
            <InputHeader
              title="受取金額"
              focus={inputStatus === "received"}
              number={4}
            />
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

            <AttractiveTextBox
              type="number"
              key={`Received-${UISession.key}`}
              onTextSet={useCallback(
                (text) =>
                  newOrderDispatch({ type: "setReceived", received: text }),
                [newOrderDispatch],
              )}
              focus={inputStatus === "received"}
            />
            <ChargeView order={newOrder} />
          </div>
        </div>
        <OrderAlertDialog
          open={inputStatus === "submit"}
          order={newOrder}
          onConfirm={submitOrder}
          onCanceled={previousStatus}
        />
      </div>
    </>
  );
};

export { CashierV2 };
