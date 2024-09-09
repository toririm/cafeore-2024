import { parseWithZod } from "@conform-to/zod";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { useState } from "react";
import useSWRSubscription from "swr/subscription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { collectionSub } from "~/firebase/subscription";
import { Item, itemSchema } from "~/models/item";
import { Order } from "~/models/order";
import { itemRepository } from "~/repositories/item";

const mockOrder: Order = {
  orderId: 1,
  createdAt: new Date(),
  servedAt: null,
  items: [
    // {
    //   type: "ice",
    //   name: "珈琲・俺ブレンド",
    //   price: 300,
    // },
    // {
    //   type: "ice",
    //   name: "珈琲・俺ブレンド",
    //   price: 400,
    // },
  ],
  assignee: "1st",
  total: 0,
  orderReady: false,
};

export default function Casher() {
  // const total = mockOrder.items.reduce((acc, cur) => acc + cur.price, 0);
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub(itemSchema),
  );
  const [recieved, setText] = useState(0);
  const [order, setOrder] = useState(mockOrder);

  // console.log(mockOrder);
  console.log(items);
  return (
    <div>
      <div>
        <ul>
          {/* <Button
            onClick={async () => {
              add_order(order, ore_blend);
              setOrder(mockOrder);
              console.log(mockOrder);
              console.log(order);
            }}
          >
            珈琲・俺ブレンド
          </Button> */}
        </ul>
      </div>
      <div>
        <ul>
          <li>
            <h2>合計金額：</h2>
            {/* <h3>{total}</h3> */}
            <h3>{order.total}</h3>
          </li>
          <li>
            <h2>受領金額：</h2>
            <form>
              <Input
                type="number"
                placeholder="受け取った金額を入力してください"
                value={recieved}
                onChange={(event) => setText(parseInt(event.target.value))}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>次の画面へ</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>金額を確認してください</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p>受領額： ¥${recieved}</p>
                      <p>合計金額： ¥$(mockOrder.total)</p>
                      <p>お釣り： ¥$(recieved - mockOrder.total) 円</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>戻る</AlertDialogCancel>
                    <AlertDialogAction type="submit">送信</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function add_order(order: Order, coffee: Item) {
  order.items.push(coffee);
  order.total = mockOrder.items.reduce((acc, cur) => acc + cur.price, 0);
  console.log(mockOrder);
  return order;
}

export const clientAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: itemSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const newItem = submission.value;
  // あとでマシなエラーハンドリングにする
  const savedItem = await itemRepository.save(newItem);

  console.log("Document written with ID: ", savedItem.id);
  return new Response(null, { status: 204 });
};
