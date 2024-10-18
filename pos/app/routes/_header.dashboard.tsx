import type { MetaFunction } from "@remix-run/react";
import { itemSource } from "common/data/items";
import { orderConverter } from "common/firebase-utils/converter";
import { collectionSub } from "common/firebase-utils/subscription";
import type { OrderEntity } from "common/models/order";
import dayjs from "dayjs";
import { orderBy } from "firebase/firestore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import useSWRSubscription from "swr/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { ChartConfig } from "~/components/ui/chart";
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

export const meta: MetaFunction = () => {
  return [{ title: "注文状況" }];
};

export default function Dashboard() {
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "desc")),
  );
  const items = itemSource;
  const unseved = orders?.reduce((acc, cur) => {
    if (cur.servedAt == null) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const itemNamesArray = items.map((items) => items.name);
  const init = new Map<string, number>();
  const numPerItem = orders?.reduce((acc, cur) => {
    if (itemNamesArray !== undefined) {
      for (let i = 0; i < cur.items.length; i++) {
        for (let j = 0; j < itemNamesArray?.length; j++) {
          if (cur.items[i].name === itemNamesArray[j]) {
            const num = acc.get(cur.items[i].name) ?? 0;
            acc.set(cur.items[i].name, num + 1);
          }
        }
      }
    }
    return acc;
  }, init);
  const itemValue = (name: string): number | undefined => {
    console.log(name);
    let valueNum = undefined;
    if (numPerItem !== undefined) {
      valueNum = numPerItem.get(name);
    }
    console.log(numPerItem);
    return valueNum;
  };
  const chartData = [
    {
      name: "べっぴん",
      num: itemValue("べっぴんブレンド"),
      fill: "var(--color-hot)",
    },
    {
      name: "俺ブレ",
      num: itemValue("珈琲・俺ブレンド"),
      fill: "var(--color-hot)",
    },
    {
      name: "ピンク",
      num: itemValue("ピンクブルボン"),
      fill: "var(--color-hot)",
    },
    {
      name: "コスタ",
      num: itemValue("コスタリカ レッドハニー"),
      fill: "var(--color-hot)",
    },
    { name: "マンデ", num: itemValue("マンデリン"), fill: "var(--color-hot)" },
    { name: "限定", num: itemValue("限定（仮）"), fill: "var(--color-hot)" },
    { name: "氷", num: itemValue("アイスコーヒー"), fill: "var(--color-ice)" },
    {
      name: "Iceオレ",
      num: itemValue("アイスオレ"),
      fill: "var(--color-aulait)",
    },
    {
      name: "Hotオレ",
      num: itemValue("ホットオレ"),
      fill: "var(--color-aulait)",
    },
    {
      name: "ミルク",
      num: itemValue("アイスミルク"),
      fill: "var(--color-milk)",
    },
  ];
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
            <Card>
              <CardHeader>
                <CardTitle>商品ごとの杯数</CardTitle>
                <CardDescription>{}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 5)}
                    />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                    <Bar
                      dataKey="num"
                      radius={8}
                      activeBar={({ ...props }) => {
                        return (
                          <Rectangle
                            {...props}
                            fillOpacity={0.8}
                            stroke={props.payload.fill}
                            strokeDasharray={4}
                            strokeDashoffset={4}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const numOfCups = (order: OrderEntity): number => {
  return order.items.length;
};

const diffTime = (order: OrderEntity) => {
  if (order.servedAt == null) return "未提供";
  return dayjs(dayjs(order.servedAt).diff(dayjs(order.createdAt))).format(
    "m:ss",
  );
};

const chartConfig = {
  name: {
    label: "杯数",
  },
  hot: {
    label: "ホット",
    color: "hsl(var(--chart-1))",
  },
  ice: {
    label: "アイス",
    color: "hsl(var(--chart-2))",
  },
  aulait: {
    label: "オレ",
    color: "hsl(var(--chart-3))",
  },
  milk: {
    label: "ミルク",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;
