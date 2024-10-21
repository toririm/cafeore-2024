import { Input } from "common/components/ui/input";
import type { OrderEntity } from "common/models/order";
import { useMemo } from "react";

type props = {
  order: OrderEntity;
};

/**
 * おつりの表示をするコンポーネント
 * @param props
 * @returns
 */
const ChargeView = ({ order }: props) => {
  const chargeView: string | number = useMemo(() => {
    const charge = order.getCharge();
    if (charge < 0) {
      return "不足しています";
    }
    return charge;
  }, [order]);

  return <Input disabled value={chargeView} />;
};

export { ChargeView };
