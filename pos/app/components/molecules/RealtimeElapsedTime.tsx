import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const RealtimeElapsedTime = ({
  order,
}: { order: WithId<OrderEntity> }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const diffTime = (order: OrderEntity) => {
    const now = new Date();
    return dayjs(dayjs(now).diff(dayjs(order.createdAt))).format("m:ss");
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return <div>経過時間：{diffTime(order)}</div>;
};
