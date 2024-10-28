import type { OrderEntity } from "common/models/order";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "../ui/button";

type props = {
  submitOrder: () => void;
  order: OrderEntity;
  focus: boolean;
};

export const SubmitSection = ({ submitOrder, order, focus }: props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const billingOk = useMemo(
    () => order.items.length > 0 && order.getCharge() >= 0,
    [order],
  );

  useEffect(() => {
    if (focus) {
      buttonRef.current?.focus();
    }
  }, [focus]);

  return (
    <div className="pt-5">
      <div className="flex justify-center">
        <Button
          ref={buttonRef}
          className="h-20 w-40 font-bold text-2xl"
          onClick={() => submitOrder()}
          disabled={!billingOk}
        >
          {billingOk && "送信"}
          {!billingOk && "送信不可"}
        </Button>
      </div>
    </div>
  );
};
