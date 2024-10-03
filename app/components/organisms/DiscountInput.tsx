import {
  type ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WithId } from "~/lib/typeguard";
import { OrderEntity } from "~/models/order";
import { useFocusRef } from "../functional/useFocusRef";
import { ThreeDigitsInput } from "../molecules/ThreeDigitsInput";

const findByOrderId = (
  orders: WithId<OrderEntity>[] | undefined,
  orderId: number,
): WithId<OrderEntity> | undefined => {
  return orders?.find((order) => order.orderId === orderId);
};

type props = ComponentPropsWithoutRef<typeof ThreeDigitsInput> & {
  focus: boolean;
  orders: WithId<OrderEntity>[] | undefined;
  onDiscountOrderFind: (order: WithId<OrderEntity>) => void;
  onDiscountOrderRemoved: () => void;
};

/**
 * 割引券番号を入力するためのコンポーネント
 */
const DiscountInput = ({
  focus,
  orders,
  onDiscountOrderFind,
  onDiscountOrderRemoved,
  ...props
}: props) => {
  const [discountOrderId, setDiscountOrderId] = useState("");
  const ref = useFocusRef(focus);

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
        disabled={!focus}
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
};

export { DiscountInput };
