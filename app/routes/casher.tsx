import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { useState } from "react";
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
import { Order } from "~/models/order";

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

export default function Casher() {
  // const total = mockOrder.items.reduce((acc, cur) => acc + cur.price, 0);
  const [recieved, setText] = useState("");
  const recieved_int = parseInt(recieved);

  console.log(mockOrder);
  return (
    <div>
      <h1>珈琲・俺POS</h1>
      <ul>
        <p>
          <h2>合計金額：</h2>
          {/* <h3>{total}</h3> */}
          <h3>{mockOrder.total}</h3>
        </p>
        <p>
          <h2>受領金額：</h2>
          <form>
            <Input
              type="number"
              placeholder="受け取った金額を入力してください"
              value={recieved}
              onChange={(event) => setText(event.target.value)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>次の画面へ</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    受領額とお釣りの額を確認してください
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {String(recieved_int - mockOrder.total) + " 円"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>戻る</AlertDialogCancel>
                  <AlertDialogAction type="submit">送信</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </p>
      </ul>
    </div>
  );
}
