import type { OrderEntity } from "~/models/order";
import { ThreeDigitsInput } from "../molecules/ThreeDigitsInput";

type props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  discountOrder?: OrderEntity;
  lastPurchasedCups: number;
};

const DiscountInput = ({
  id,
  value,
  onChange,
  disabled,
  discountOrder,
  lastPurchasedCups,
}: props) => {
  return (
    <div>
      <p>割引券番号</p>
      <ThreeDigitsInput
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <p>
        {discountOrder === undefined ? "見つかりません" : null}
        {discountOrder && `有効杯数: ${lastPurchasedCups}`}
      </p>
    </div>
  );
};

export { DiscountInput };
