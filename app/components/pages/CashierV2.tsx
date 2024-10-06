import { useCallback, useEffect, useMemo, useState } from "react";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { useInputStatus } from "../functional/useInputStatus";
import { useLatestOrderId } from "../functional/useLatestOrderId";
import { useOrderState } from "../functional/useOrderState";
import { usePreventNumberKeyUpDown } from "../functional/usePreventNumberKeyUpDown";
import { useUISession } from "../functional/useUISession";
import { AttractiveTextArea } from "../molecules/AttractiveTextArea";
import { InputHeader } from "../molecules/InputHeader";
import { DiscountInput } from "../organisms/DiscountInput";
import { OrderItemEdit } from "../organisms/OrderItemEdit";
import { OrderReceivedInput } from "../organisms/OrderReceivedInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  useEffect(() => {
    if (inputStatus === "submit") {
      setDrawerOpen(true);
    }
  }, [inputStatus]);

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
            <div className="flex justify-center">
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
          </div>
          <div className="flex-1">
            <InputHeader
              title="備考"
              focus={inputStatus === "description"}
              number={3}
            />
            <div className="pt-5">
              <AttractiveTextArea
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
          </div>
          <div className="flex-1">
            <InputHeader
              title="会計"
              focus={inputStatus === "received"}
              number={4}
            />
            <div className="pt-5">
              <OrderReceivedInput
                key={`Received-${UISession.key}`}
                onTextSet={useCallback(
                  (received) =>
                    newOrderDispatch({ type: "setReceived", received }),
                  [newOrderDispatch],
                )}
                focus={inputStatus === "received"}
                order={newOrder}
              />
            </div>
          </div>
        </div>
        {/* <ConfirmDrawer focus={inputStatus === "submit"} onConfirm={submitOrder}>
          <div className="grid grid-cols-2">
            <p className="text-center text-sm text-stone-400">Enter で送信</p>
            <p className="text-center text-sm text-stone-400">
              左矢印キーで戻る
            </p>
          </div>
        </ConfirmDrawer> */}
        <AlertDialog open={inputStatus === "submit"}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>送信しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                Tabを押してから、Enterで送信
              </AlertDialogDescription>
              <AlertDialogDescription>左矢印キーで戻る</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={submitOrder}>送信</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export { CashierV2 };
