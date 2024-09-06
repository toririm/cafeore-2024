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
import { Item } from "~/models/item";
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
  const ore_blend: Item = {
    type: "ice",
    name: "珈琲・俺ブレンド",
    price: 300,
  };
  const champ_blend: Item = {
    type: "hot",
    name: "優勝ブレンド",
    price: 300,
  };
  const edel: Item = {
    type: "hot",
    name: "エーデルワイス",
    price: 300,
  };
  const keny: Item = {
    type: "ice",
    name: "ケニア",
    price: 300,
  };
  const bra: Item = {
    type: "hot",
    name: "ブラジルブルボン",
    price: 300,
  };
  const ore: Item = {
    type: "ore",
    name: "カフェオレ",
    price: 300,
  };
  const ice: Item = {
    type: "ice",
    name: "アイスコーヒー",
    price: 300,
  };
  const milk: Item = {
    type: "milk",
    name: "アイスミルク",
    price: 300,
  };
  const [recieved, setText] = useState(0);
  const [order, setOrder] = useState(mockOrder);

  // console.log(mockOrder);
  return (
    <div>
      <div>
        <ul>
          <Button
            onClick={async () => {
              add_order(ore_blend);
              setOrder(mockOrder);
              console.log(mockOrder);
              console.log(order);
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

export function add_order(coffee: Item) {
  mockOrder.items.push(coffee);
  mockOrder.total = mockOrder.items.reduce((acc, cur) => acc + cur.price, 0);
  console.log(mockOrder);
  return mockOrder;
}
