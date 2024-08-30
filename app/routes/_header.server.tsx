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
      <h1 className="text-3xl">アイテム</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Card>
              <CardHeader>
                <CardTitle>{order.orderId}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.id}</p>
                <div>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <h3>{item.name}</h3>
                      <p>{item.price}</p>
                      <p>{type2label[item.type]}</p>
                    </div>
                  ))}
                </div>
                <p>{order.createdAt.toISOString()}</p>
                <p>{`提供時間：${order.servedAt?.toISOString()}`}</p>
                <p>{order.total}</p>
                <p>{order.orderReady}</p>
              </CardContent>
              <CardFooter>
                <Button>提供</Button>
              </CardFooter>

            </Card>


            {/* <h2>{order.orderId}</h2>
            <p>{order.id}</p>
            <div>
              {order.items.map((item) => (
                <div key={item.id}>
                  <h3>{item.name}</h3>
                  <p>{item.price}</p>
                  <p>{type2label[item.type]}</p>
                </div>
              ))}
            </div>
            <p>{order.createdAt.toISOString()}</p>
            <p>{`提供時間：${order.servedAt?.toISOString()}`}</p>
            <p>{order.total}</p>
            <p>{order.orderReady}</p> */}
          </li>
        ))}
      </ul>
    </div>
  );
}

