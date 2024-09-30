import { parseWithZod } from "@conform-to/zod";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { TrashIcon } from "@radix-ui/react-icons";
import { type ClientActionFunction, useSubmit } from "@remix-run/react";
import { useState } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
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
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { stringToJSONSchema } from "~/lib/custom-zod";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import { OrderEntity, orderSchema } from "~/models/order";
import { orderRepository } from "~/repositories/order";

export default function Casher() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub({ converter: itemConverter }),
  );
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }),
  );
  const curOrderId =
    orders?.reduce((acc, cur) => Math.max(acc, cur.orderId), 0) ?? 0;
  const nextOrderId = curOrderId + 1;
  const submit = useSubmit();
  const order = OrderEntity.createNew({ orderId: nextOrderId });
  const [recieved, setReceived] = useState(0);
  const [queue, setQueue] = useState<WithId<ItemEntity>[]>([]);
  order.items = queue;
  const charge = recieved - order.total;
  const [description, setDescription] = useState("");
  order.description = description;

  const submitOrder = (() => {
    console.log(charge);
    if (charge < 0) {
      return;
    }
    if (queue.length === 0) {
      return;
    }
    submit({ newOrder: JSON.stringify(order.toOrder()) }, { method: "POST" });
    console.log("送信");
    setQueue([]);
    setReceived(0);
    setDescription("");
  });

  return (
    <div className="p-[15px]">
      <div className="flex h-screen flex-row flex-wrap">
        <div className="w-2/3">
          <div className="grid h-screen grid-cols-2">
            {items?.map((item) => (
              <div key={item.id}>
                <Button
                  onClick={async () => {
                    setQueue([...queue, item]);
                  }}
                >
                  {item.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/3">
          <div>
            <Table>
              <TableCaption />
              <TableHeader>
                <TableRow>
                  <TableHead className="w-500">No. {nextOrderId}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue?.map((item, index) => (
                  <TableRow
                    key={`${index}-${item.id}`}
                    className="relative h-[50px]"
                  >
                    <TableCell className="relative font-medium">
                      <div className="absolute left-[50px]">{item.name}</div>
                      <Button // ここで削除ボタンを押すと、mockOrder.itemsから削除する
                        type="button"
                        className="absolute right-[50px] h-[30px] w-[25px]"
                        onClick={() => {
                          setQueue((prev) => {
                            const newItems = [...prev];
                            newItems.splice(index, 1);
                            return newItems;
                          });
                        }}
                      >
                        <div>
                          <TrashIcon />
                        </div>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ul>
              <li>
                <Input
                  id="description"
                  name="description"
                  type="string"
                  placeholder="備考欄"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="relative">合計金額：{order.total} 円</p>
              </li>
              <li>
                <form>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="absolute right-[100px]">確定</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          金額・備考欄を確認してください
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <p>備考欄：{order.description}</p>
                          <p>
                            受領額：
                            <Input
                              id="recieved"
                              name="recieved"
                              type="number"
                              placeholder="受け取った金額を入力してください"
                              value={recieved}
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value);
                                setReceived(Number.isNaN(value) ? 0 : value); // NaN のチェック
                              }}
                            />
                          </p>
                          <p>合計： {order.total} 円</p>
                          <p>
                            お釣り：{" "}{Number.isNaN(charge) || charge < 0 ? 0 : charge}{" "}円
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>戻る</AlertDialogCancel>
                        <AlertDialogAction onClick={submitOrder}>
                          送信
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const schema = z.object({
    newOrder: stringToJSONSchema.pipe(orderSchema),
  });
  const submission = parseWithZod(formData, {
    schema,
  });
  if (submission.status !== "success") {
    console.error(submission.error);
    return submission.reply();
  }

  const { newOrder } = submission.value;
  const order = OrderEntity.fromOrderWOId(newOrder);

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};

function setOrderItems(arg0: never[]) {
  throw new Error("Function not implemented.");
}

function setReceived(arg0: string) {
  throw new Error("Function not implemented.");
}

function setDiscountOrderId(arg0: string) {
  throw new Error("Function not implemented.");
}

function setDescription(arg0: string) {
  throw new Error("Function not implemented.");
}

function setInputStatus(arg0: string) {
  throw new Error("Function not implemented.");
}
