import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Input } from "~/components/ui/input";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, type2label } from "~/models/item";
import { OrderEntity } from "~/models/order";
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

export type Action =
  | { type: "clear" }
  | { type: "updateOrderId"; orderId: number }
  | {
      type: "addItem";
      item: WithId<ItemEntity>;
    }
  | {
      type: "mutateItem";
      idx: number;
      action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>;
    }
  | { type: "applyDiscount"; discountOrder: WithId<OrderEntity> }
  | { type: "removeDiscount" };

const reducer = (state: OrderEntity, action: Action): OrderEntity => {
  const addItem = (item: WithId<ItemEntity>) => {
    const updated = state.clone();
    updated.items = [...updated.items, item];
    return updated;
  };
  const applyDiscount = (discountOrder: WithId<OrderEntity>) => {
    const updated = state.clone();
    updated.applyDiscount(discountOrder);
    return updated;
  };
  const removeDiscount = () => {
    const updated = state.clone();
    updated.removeDiscount();
    return updated;
  };
  const mutateItem = (
    idx: number,
    action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>,
  ) => {
    const updated = state.clone();
    updated.items[idx] = action(updated.items[idx]);
    return updated;
  };

  switch (action.type) {
    case "clear":
      return OrderEntity.createNew({ orderId: state.orderId });
    case "updateOrderId":
      return OrderEntity.createNew({ orderId: action.orderId });
    case "applyDiscount":
      return applyDiscount(action.discountOrder);
    case "removeDiscount":
      return removeDiscount();
    case "addItem":
      return addItem(action.item);
    case "mutateItem":
      return mutateItem(action.idx, action.action);
  }
};

const latestOrderId = (orders: WithId<OrderEntity>[] | undefined): number => {
  if (!orders) {
    return 0;
  }
  return orders.reduce((acc, cur) => Math.max(acc, cur.orderId), 0);
};

const CashierV2 = ({ items, orders, submitPayload }: props) => {
  const nextOrderId = useMemo(() => latestOrderId(orders) + 1, [orders]);
  const [newOrder, dispatch] = useReducer(
    reducer,
    OrderEntity.createNew({ orderId: nextOrderId }),
  );
  const [orderItems, setOrderItems] = useState<WithId<ItemEntity>[]>([]);
  const [received, setReceived] = useState("");
  const [description, setDescription] = useState("");
  const [inputStatus, setInputStatus] =
    useState<(typeof InputStatus)[number]>("discount");
  const [dialogOpen, setDialogOpen] = useState(false);

  const charge = newOrder.received - newOrder.billingAmount;
  const chargeView: string | number = charge < 0 ? "不足しています" : charge;

  const receivedDOM = useRef<HTMLInputElement>(null);
  const descriptionDOM = useRef<HTMLInputElement>(null);
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
    dispatch({ type: "clear" });
    submitPayload(newOrder);
  }, [charge, newOrder, submitPayload]);

  const moveFocus = useCallback(() => {
    switch (inputStatus) {
      case "discount":
        setDialogOpen(false);
        discountInputDOM.current?.focus();
        break;
      case "items":
        break;
      case "received":
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
        dispatch({ type: "clear" });
      },
    };
  }, [proceedStatus, prevousStatus]);

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
          <DiscountInput
            ref={discountInputDOM}
            disabled={inputStatus !== "discount"}
            orders={orders}
            onDiscountOrderFind={useCallback(
              (discountOrder) =>
                dispatch({ type: "applyDiscount", discountOrder }),
              [],
            )}
            onDiscountOrderRemoved={useCallback(
              () => dispatch({ type: "removeDiscount" }),
              [],
            )}
          />
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
          <OrderItemView
            items={items}
            order={newOrder}
            onAddItem={useCallback(
              (item) => dispatch({ type: "addItem", item }),
              [],
            )}
            mutateItem={useCallback(
              (idx, action) => dispatch({ type: "mutateItem", idx, action }),
              [],
            )}
            focus={inputStatus === "items"}
            discountOrder={useMemo(
              () => newOrder.discountInfo.previousOrderId !== null,
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
