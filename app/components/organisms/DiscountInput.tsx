import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WithId } from "~/lib/typeguard";
import { OrderEntity } from "~/models/order";
import { ThreeDigitsInput } from "../molecules/ThreeDigitsInput";

const findByOrderId = (
  orders: WithId<OrderEntity>[] | undefined,
  orderId: number,
): WithId<OrderEntity> | undefined => {
  return orders?.find((order) => order.orderId === orderId);
};

// 割引券番号を入力するためのコンポーネント
const DiscountInput = forwardRef<
  ElementRef<typeof ThreeDigitsInput>,
  ComponentPropsWithoutRef<typeof ThreeDigitsInput> & {
    orders: WithId<OrderEntity>[] | undefined;
    onDiscountOrderFind: (discountOrder: WithId<OrderEntity>) => void;
    onDiscountOrderRemoved: () => void;
  }
>(({ orders, onDiscountOrderFind, onDiscountOrderRemoved, ...props }, ref) => {
  const [discountOrderId, setDiscountOrderId] = useState("");

  const isComplete = useMemo(
    () => discountOrderId.length === 3,
    [discountOrderId],
  );

  const discountOrder = useMemo(() => {
    if (!isComplete) return;
    const discountOrderIdNum = Number(discountOrderId);
    return findByOrderId(orders, discountOrderIdNum);
  }, [orders, isComplete, discountOrderId]);

  const lastPurchasedCups = useMemo(
    () => discountOrder?.getCoffeeCount() ?? 0,
    [discountOrder],
  );

  useEffect(() => {
    if (isComplete && discountOrder) {
      onDiscountOrderFind(discountOrder);
    }
    return onDiscountOrderRemoved;
  }, [isComplete, discountOrder, onDiscountOrderFind, onDiscountOrderRemoved]);

  return (
    <div>
      <p>割引券番号</p>
      <ThreeDigitsInput
        ref={ref}
        value={discountOrderId}
        onChange={(value) => setDiscountOrderId(value)}
        {...props}
      />
      <p>
        {!isComplete && "3桁の割引券番号を入力してください"}
        {isComplete &&
          (discountOrder instanceof OrderEntity
            ? `有効杯数: ${lastPurchasedCups}`
            : "見つかりません")}
      </p>
    </div>
  );
});

export { DiscountInput };
