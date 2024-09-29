import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { TrashIcon } from "@radix-ui/react-icons";
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
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import { OrderEntity } from "~/models/order";

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
  const order = OrderEntity.createNew({ orderId: nextOrderId });
  const [recieved, setText] = useState(0);
  const [queue, setQueue] = useState<WithId<ItemEntity>[]>([]);
  order.items = queue;

  return (
    <div>
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
                  <TableHead className="w-500">No. {curOrderId}</TableHead>
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
                <h2 className="relative">合計金額：{order.total} 円</h2>
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
                          金額を確認してください
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <p>
                            受領額：
                            <Input
                              type="number"
                              placeholder="受け取った金額を入力してください"
                              value={recieved}
                              onChange={(event) =>
                                setText(Number.parseInt(event.target.value))
                              }
                            />
                          </p>
                          <p>合計： {order.total} 円</p>
                          <p>
                            お釣り： {recieved - order.total < 0 && 0}
                            {recieved - order.total >= 0 &&
                              recieved - order.total}{" "}
                            円
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">
                          戻る
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">
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
