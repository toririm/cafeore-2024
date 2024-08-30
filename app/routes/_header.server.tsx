import type { MetaFunction } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { orderRepository } from "~/repositories/order";


export const meta: MetaFunction = () => {
  return [{ title: "オーダー" }];
};

const type2label = {
  hot: "ホット",
  ice: "アイス",
  ore: "オレ",
  milk: "ミルク",
};

export const clientLoader = async () => {
  console.log("findAllのテスト");
  const orders = await orderRepository.findAll();
  return typedjson({ orders });
};

export default function Server() {

  const { orders } = useTypedLoaderData<typeof clientLoader>();

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">提供</h1>
      <div className="grid grid-cols-4 gap-4">
        {orders.map((order) => (
          <div key={order.id}>
            <Card>
              <CardHeader>
                <CardTitle>{order.orderId}</CardTitle>
                <p>{order.createdAt.toISOString()}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <Card>
                        <CardContent>
                          <h3>{item.name}</h3>
                          <p>{type2label[item.type]}</p>                          
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                <p>{`提供時間：${order.servedAt?.toISOString()}`}</p>
              </CardContent>
              <CardFooter>
                <p>{order.orderReady}</p>
                <Button>提供</Button>
              </CardFooter>

            </Card>

          </div>
        ))}
      </div>
    </div>
  );
}

