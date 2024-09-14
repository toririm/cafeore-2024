import { parseWithZod } from "@conform-to/zod";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { indexOf } from "lodash";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
    //   id: "1",
    //   type: "ice",
    //   name: "珈琲・俺ブレンド",
    //   price: 300,
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
  const [total, setTotal] = useState(0);
  const [queue, setQueue] = useState<Item[]>([]);

  // console.log(mockOrder);
  // console.log(items?.[0]);
  return (
    <div>
      <div>No. {mockOrder.orderId}</div>
      <div>
        <ul>
          {items?.map((item) => (
            <p key={item.id}>
              <Button
                onClick={async () => {
                  mockOrder.items.push(item);
                  mockOrder.total = mockOrder.items.reduce(
                    (acc, cur) => acc + cur.price,
                    0,
                  );
                  setQueue(mockOrder.items);
                  setTotal(mockOrder.total);
                  console.log(mockOrder);
                }}
              >
                {item.name}
              </Button>
            </p>
          ))}
        </ul>
      </div>
      <div>
        <Table>
          <TableCaption>注文内容</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">オーダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="parent">
                  {item.name}
                  <Button
                    type="button"
                    className="right"
                    onClick={(key) => {
                      mockOrder.items.splice(indexOf(mockOrder.items, item));
                      mockOrder.total = mockOrder.items.reduce(
                        (acc, cur) => acc + cur.price,
                        0,
                      );
                      setQueue(mockOrder.items);
                      setTotal(mockOrder.total);
                      console.log(mockOrder);
                    }}
                  >
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <ul>
          <li>
            <h2>合計金額：</h2>
            <h3>{total}</h3>
            {/* <h3>{mockOrder.reduce}</h3> */}
          </li>
          <li>
            {/* <h2>受領金額：</h2> */}
            <form>
              {/* <Input
                type="number"
                placeholder="受け取った金額を入力してください"
                value={recieved}
                onChange={(event) => setText(parseInt(event.target.value))}
              /> */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>確定</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>金額を確認してください</AlertDialogTitle>
                    <AlertDialogDescription>
                      {/* <p>受領額： {recieved} 円</p> */}
                      <p>
                        受領額：
                        <Input
                          type="number"
                          placeholder="受け取った金額を入力してください"
                          value={recieved}
                          onChange={(event) =>
                            setText(parseInt(event.target.value))
                          }
                        />
                      </p>
                      <p>合計： {mockOrder.total} 円</p>
                      <p>
                        お釣り： {recieved - mockOrder.total < 0 && 0}
                        {recieved - mockOrder.total >= 0 &&
                          recieved - mockOrder.total}{" "}
                        円
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">戻る</AlertDialogCancel>
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
