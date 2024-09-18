import { type MetaFunction } from "@remix-run/react";
import { orderBy } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { type2label } from "~/models/item";

export const meta: MetaFunction = () => {
  return [{ title: "マスター画面" }];
};

export default function FielsOfMaster() {
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "desc")),
  );

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">マスター</h1>
        <p>提供待ちオーダー数：</p>
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
                        <CardContent className="pt-6">
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
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
