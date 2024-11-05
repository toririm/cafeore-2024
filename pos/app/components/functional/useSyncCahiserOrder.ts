import type { OrderEntity } from "common/models/order";
import { useEffect } from "react";

export const useSyncCahiserOrder = (
  order: OrderEntity,
  syncOrder: (order: OrderEntity) => void,
) => {
  /**
   * BAD: stateの更新にはuseEffectを使わない
   * https://ja.react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes
   */
  useEffect(() => {
    syncOrder(order);
  }, [order, syncOrder]);
};
