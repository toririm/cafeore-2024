import type { MetaFunction } from "@remix-run/react";
import dayjs from "dayjs";
import { orderBy } from "firebase/firestore";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import useSWRSubscription from "swr/subscription";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { itemConverter, orderConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import type { OrderEntity } from "~/models/order";

export const meta: MetaFunction = () => {
  return [{ title: "注文状況" }];
};

const Dashboard = (props: HighchartsReact.Props) => {
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "desc")),
  );
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub({ converter: itemConverter }),
  );
  const unseved = orders?.reduce((acc, cur) => {
    if (cur.servedAt == null) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const itemNamesArray = items?.map((items) => items.name);
  // const numData = orders?.map((orders) => orders.items);
  // const numberPerMenu = (orders: OrderEntity) => {
  //   return;
  // };
  // console.log(numData);
  const options: Highcharts.Options = {
    title: {
      text: "種類別杯数",
    },
    series: [
      {
        type: "column",
        data: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    ],
    xAxis: { categories: itemNamesArray },
    yAxis: { type: "linear" },
  };

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">注文状況</h1>
        <p>提供待ちオーダー数：{unseved}</p>
      </div>
      <div className="flex justify-start pb-2">
        <div className="w-1/2">
          <Table>
            <TableCaption />
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>杯数</TableHead>
                <TableHead>合計額</TableHead>
                <TableHead>受付時刻</TableHead>
                <TableHead>提供時刻</TableHead>
                <TableHead>時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{numOfCups(order)}</TableCell>
                  <TableCell>￥{order.total}</TableCell>
                  <TableCell>{order.createdAt.toLocaleTimeString()}</TableCell>
                  <TableCell>
                    {order.servedAt == null
                      ? "未提供"
                      : order.servedAt?.toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{diffTime(order)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter />
          </Table>
        </div>
        <div className="w-1/2">
          <div className="sticky top-0">
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              ref={chartComponentRef}
              {...props}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const numOfCups = (order: OrderEntity): number => {
  return order.items.length;
};

const diffTime = (order: OrderEntity) => {
  if (order.servedAt == null) return "未提供";
  return dayjs(dayjs(order.servedAt).diff(dayjs(order.createdAt))).format(
    "m:ss",
  );
};

export default Dashboard;
