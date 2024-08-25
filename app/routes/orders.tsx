import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Order } from "~/models/order";
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

export default function Orders() {
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
      <Form method="post">
        <Input type="number" name="orderId" required placeholder="注文番号" />
        <Button type="submit">登録</Button>
      </Form>
      <Form method="delete">
        <Input type="text" name="id" required placeholder="id" />
        <Button type="submit">削除</Button>
      </Form>
      <Form method="put">
        <Input type="text" name="id" required placeholder="id" />
        <Button type="submit">更新</Button>
      </Form>
    </div>
  );
}

const testOrder = (orderId: number): Order => ({
  orderId,
  items: [
    {
      id: "1",
      name: "テスト",
      price: 100,
      type: "hot",
    },
  ],
  createdAt: new Date(),
  servedAt: null,
  assignee: null,
  total: 100,
  orderReady: false,
});

export const clientAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  switch (request.method) {
    case "POST":
      console.log("save(create)のテスト");
      const orderId = Number(formData.get("orderId"));
      const newOrder = testOrder(orderId);
      const savedOrder = await orderRepository.save(newOrder);
      console.log("created", savedOrder);
      break;

    case "DELETE":
      console.log("deleteのテスト");
      const id = formData.get("id");
      await orderRepository.delete(id as string);
      break;

    case "PUT":
      console.log("save(update)のテスト");
      const id2 = formData.get("id");
      const order = await orderRepository.findById(id2 as string);
      if (order) {
        order.servedAt = new Date();
        await orderRepository.save(order);
      }
      break;
  }

  return null;
};
