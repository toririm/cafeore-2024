import type { MetaFunction } from "@remix-run/react";
import { orderBy } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { cn } from "~/lib/utils";
import { type2label } from "~/models/item";
import { orderRepository } from "~/repositories/order";

export const meta: MetaFunction = () => {
  return [{ title: "提供画面" }];
};

export const clientLoader = async () => {
  const orders = await orderRepository.findAll();
  return { orders };
};

export default function Serve() {
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "desc")),
  );

  const unserved = orders?.reduce((acc, cur) => {
    if (cur.servedAt == null) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">提供</h1>
        <p>提供待ちオーダー数：{unserved}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {orders?.map((order) => (
          <div key={order.id}>
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{`No. ${order.orderId}`}</CardTitle>
                  <p>{order.createdAt.toLocaleTimeString()}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <Card>
                        <CardContent
                          className={cn(
                            "pt-6",
                            item.type === "milk" && "bg-yellow-200",
                            item.type === "hotOre" && "bg-orange-300",
                            item.type === "iceOre" && "bg-blue-300",
                          )}
                        >
                          <h3>{item.name}</h3>
                          <p>{type2label[item.type]}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                <p>{order.orderReady}</p>
                <div className="flex justify-between pt-4">
                  <p className="flex items-center">{`提供時間：${order.servedAt?.toLocaleTimeString()}`}</p>
                  <Button>提供</Button>
                </div>
              </CardContent>
              <CardFooter>備考欄：{order?.description}</CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
