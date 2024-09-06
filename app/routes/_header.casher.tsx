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
  const [recieved, setText] = useState("");
  const recieved_int = parseInt(recieved);
  const item_model = {
    ore_blend: {
      type: "ice" as "hot" | "ice" | "ore" | "milk",
      name: "珈琲・俺ブレンド",
      price: 300,
    },
    champ_blend: {
      type: "hot" as "hot" | "ice" | "ore" | "milk",
      name: "優勝ブレンド",
      price: 300,
    },
    edel: {
      type: "hot" as "hot" | "ice" | "ore" | "milk",
      name: "エーデルワイス",
      price: 300,
    },
    keny: {
      type: "ice" as "hot" | "ice" | "ore" | "milk",
      name: "ケニア",
      price: 300,
    },
    bra: {
      type: "hot" as "hot" | "ice" | "ore" | "milk",
      name: "ブラジルブルボン",
      price: 300,
    },
    ore: {
      type: "ore" as "hot" | "ice" | "ore" | "milk",
      name: "カフェオレ",
      price: 300,
    },
    ice: {
      type: "ice" as "hot" | "ice" | "ore" | "milk",
      name: "アイスコーヒー",
      price: 300,
    },
    milk: {
      type: "milk" as "hot" | "ice" | "ore" | "milk",
      name: "アイスミルク",
      price: 300,
    },
  };

  console.log(mockOrder);
  return (
    <div>
      <div>
        <ul>
          <Button
            onClick={async () => {
              mockOrder.items.push(item_model.ore_blend);
              mockOrder.total = mockOrder.items.reduce(
                (acc, cur) => acc + cur.price,
                0,
              );
              console.log(mockOrder);
            }}
          >
            珈琲・俺ブレンド
          </Button>
        </ul>
      </div>
      <div>
        <ul>
          <li>
            <h2>合計金額：</h2>
            {/* <h3>{total}</h3> */}
            <h3>{mockOrder.total}</h3>
          </li>
          <li>
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
                    <AlertDialogTitle>金額を確認してください</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p>{"受領額：" + recieved}</p>
                      <p>{"合計金額：" + String(mockOrder.total)}</p>
                      <p>
                        {"お釣り：" +
                          String(recieved_int - mockOrder.total) +
                          " 円"}
                      </p>
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
