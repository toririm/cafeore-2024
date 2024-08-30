import type { MetaFunction } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Order } from "~/models/order";
import { orderRepository } from "~/repositories/order";


const mockOrder: Order = {
  orderId: 1,
  createdAt: new Date(),
  servedAt: null,
  items: [
    {
      type: "ice",
      name: "珈琲・俺ブレンド",
      price: 300,
    },
    {
      type: "ice",
      name: "珈琲・俺ブレンド",
      price: 400,
    },
  ],
  assignee: "1st",
  total: 700,
  orderReady: false,
};

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
  console.log(mockOrder);

  const { orders } = useTypedLoaderData<typeof clientLoader>();

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">アイテム</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <h2>{order.orderId}</h2>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

