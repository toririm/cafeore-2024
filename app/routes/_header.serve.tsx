import { type MetaFunction } from "@remix-run/react";
import { doc, updateDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import useSWRSubscription from "swr/subscription";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { orderConverter } from "~/firebase/converter";
import { prodDB } from "~/firebase/firestore";
import { collectionSub } from "~/firebase/subscription";
import { type2label } from "~/models/item";

export const meta: MetaFunction = () => {
  return [{ title: "提供画面" }];
};

interface OrderItem {
  id: string;
  name: string;
  type: string;
  // Add any other properties that might be present in the item object
}

interface Order {
  id: string;
  orderId: string;
  createdAt: number;
  servedAt?: string;
  items: OrderItem[];
  status: string;
}

export default function Serve() {
  const { data: orders, mutate } = useSWRSubscription<Order[]>(
    "orders",
    collectionSub(orderConverter),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cupStatus, setCupStatus] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const pendingOrders =
    orders
      ?.filter((order) => !order.servedAt)
      .filter(
        (order) =>
          order.orderId.toString().includes(searchTerm) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      .sort((a, b) => a.createdAt - b.createdAt) || [];

  const toggleCupStatus = useCallback((orderId: string, itemId: string) => {
    setCupStatus((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: !prev[orderId]?.[itemId],
      },
    }));
  }, []);

  const isOrderReady = useCallback(
    (orderId: string, items: OrderItem[]) => {
      return items.every((item) => cupStatus[orderId]?.[item.id]);
    },
    [cupStatus],
  );

  const handleServe = async (orderId: string) => {
    setIsProcessing(true);
    try {
      const orderRef = doc(prodDB, "orders", orderId);
      await updateDoc(orderRef, {
        servedAt: new Date().toISOString(),
        status: "served",
      });

      console.log(`Order ${orderId} served successfully`);
      // Update local state to remove the served order
      mutate((prev) => prev?.filter((order) => order.id !== orderId));
      // Clear cup status for the served order
      setCupStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[orderId];
        return newStatus;
      });
    } catch (error) {
      console.error("Error serving order:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between items-center pb-4">
        <h1 className="text-3xl">提供</h1>
        <p>提供待ちオーダー数：{pendingOrders.length}</p>
      </div>
      <Input
        type="text"
        placeholder="オーダー番号または商品名で検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pendingOrders.map((order) => (
          <Card
            key={order.id}
            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardHeader className="bg-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">{`No. ${order.orderId}`}</CardTitle>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {order.items.map((item: OrderItem) => (
                  <Card
                    key={item.id}
                    className={`bg-gray-50 cursor-pointer ${cupStatus[order.id]?.[item.id] ? "bg-green-100" : ""}`}
                    onClick={() => toggleCupStatus(order.id, item.id)}
                  >
                    <CardContent className="p-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {type2label[item.type]}
                      </p>
                      <p className="text-sm font-bold">
                        {cupStatus[order.id]?.[item.id] ? "準備完了" : "準備中"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  {order.servedAt
                    ? `提供時間：${new Date(order.servedAt).toLocaleTimeString()}`
                    : "未提供"}
                </p>
                <Button
                  onClick={() => handleServe(order.id)}
                  disabled={
                    isProcessing || !isOrderReady(order.id, order.items)
                  }
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isProcessing ? "処理中..." : "提供"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
