import {
  Form,
  type ClientActionFunction,
  type ClientActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type2label } from "~/models/item";
import { OrderEntity } from "~/models/order";
import { orderRepository } from "~/repositories/order";

export const meta: MetaFunction = () => {
  return [{ title: "オーダー" }];
};

export const clientLoader = async () => {
  console.log("findAllのテスト");
  const orders = await orderRepository.findAll();
  return typedjson({ orders });
};

export default function Orders() {
  const { orders } = useTypedLoaderData<typeof clientLoader>();

  return (
    <div className="p-4 font-sans">
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

export const clientAction: ClientActionFunction = async (args) => {
  const { request } = args;

  switch (request.method) {
    // TODO: func1, func2, func3 の命名を適切に、そしてすべて引数にargsを取るようにする
    case "POST":
      console.log("save(create)のテスト");
      func1();
      break;

    case "DELETE":
      func2(request);
      break;

    case "PUT":
      func3(args);
      break;
  }

  return null;
};

// できればファイル分割もしたい

const func1 = async () => {
  console.log("save(create)のテスト");
  const newOrder = OrderEntity.createNew({ orderId: 1 });
  const savedOrder = await orderRepository.save(newOrder);
  console.log("created", savedOrder);
};

const func2 = async (request: Request) => {
  const formData = await request.formData();
  console.log("deleteのテスト");
  const id = formData.get("id");
  await orderRepository.delete(id as string);
};

const func3 = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("save(update)のテスト");
  const id2 = formData.get("id");
  const order = await orderRepository.findById(id2 as string);
  if (order) {
    order.beServed();
    await orderRepository.save(order);
  }
};
