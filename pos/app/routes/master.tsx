import { orderConverter } from "&/firebase-utils/converter";
import { collectionSub } from "&/firebase-utils/subscription";
import { type2label } from "&/models/item";
import type { MetaFunction } from "@remix-run/react";
import { orderBy } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "マスター画面" }];
};

export default function FielsOfMaster() {
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "asc")),
  );

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">マスター</h1>
        <p>提供待ちオーダー数：</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {orders?.map(
          (order) =>
            order.servedAt === null && (
              <div key={order.id}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{`No. ${order.orderId}`}</CardTitle>
                      <CardTitle className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-500">
                        {order.items.length}
                      </CardTitle>
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
                                item.type === "hot" && "bg-red-300",
                                item.type === "ice" && "bg-blue-300",
                                item.type === "hotOre" && "bg-orange-300",
                                item.type === "iceOre" && "bg-sky-300",
                                item.type === "milk" && "bg-yellow-200",
                              )}
                            >
                              <h3 className="font-bold">{item.name}</h3>
                              <p className="text-sm text-stone-500">
                                {type2label[item.type]}
                              </p>
                              {item.assignee && (
                                <p className="text-sm">指名:{item.assignee}</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                    {/* <p>{order.orderReady}</p> */}
                    {/* <div className="flex justify-between pt-4">
                      <p className="flex items-center">{`提供時間：${order.servedAt?.toLocaleTimeString()}`}</p>
                    </div> */}
                  </CardContent>
                </Card>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
