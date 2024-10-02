import { useMemo } from "react";
import type { WithId } from "~/lib/typeguard";
import type { OrderEntity } from "~/models/order";

const useLatestOrderId = (orders: WithId<OrderEntity>[] | undefined) => {
  const latestOrderId = useMemo(
    () => orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 0,
    [orders],
  );
  const nextOrderId = useMemo(() => latestOrderId + 1, [latestOrderId]);

  return { latestOrderId, nextOrderId };
};
export { useLatestOrderId };
