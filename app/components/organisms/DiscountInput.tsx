import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import type { WithId } from "~/lib/typeguard";
import type { OrderEntity } from "~/models/order";
import { ThreeDigitsInput } from "../molecules/ThreeDigitsInput";

// 割引券番号を入力するためのコンポーネント
const DiscountInput = forwardRef<
  ElementRef<typeof ThreeDigitsInput>,
  ComponentPropsWithoutRef<typeof ThreeDigitsInput> & {
    discountOrder: WithId<OrderEntity> | undefined;
    lastPurchasedCups: number;
  }
>(({ discountOrder, lastPurchasedCups, ...props }, ref) => {
  return (
    <div>
      <p>割引券番号</p>
      <ThreeDigitsInput ref={ref} {...props} />
      <p>
        {discountOrder === undefined ? "見つかりません" : null}
        {discountOrder && `有効杯数: ${lastPurchasedCups}`}
      </p>
    </div>
  );
});

export { DiscountInput };
