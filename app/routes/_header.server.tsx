import type { MetaFunction } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { orderRepository } from "~/repositories/order";


export const meta: MetaFunction = () => {
  return [{ title: "提供画面" }];
};

const type2label = {
  hot: "ホット",
  ice: "アイス",
  ore: "オレ",
  milk: "ミルク",
};

export const clientLoader = async () => {
  const orders = await orderRepository.findAll();
  return typedjson({ orders });
};

export default function Server() {

  const { orders } = useTypedLoaderData<typeof clientLoader>();

  return (
    <div className="font-sans p-4">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">提供</h1>
        <p>提供待ちオーダー数：</p>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {orders.map((order) => (
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
                  <Button>提供</Button>
                </div>
              </CardContent>

            </Card>

          </div>
        ))}
      </div>
    </div>
  );
}
