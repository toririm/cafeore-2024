import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { type2label } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import { AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";

type props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderEntity;
  chargeView: number | string;
  onSubmit: () => void;
};

const OrderAlertDialog = ({
  open,
  onOpenChange,
  order,
  chargeView,
  onSubmit,
}: props) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>オーダーを確定しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            以下の内容で提出します
          </AlertDialogDescription>
          {order.items.map((item, idx) => (
            <AlertDialogDescription key={`${idx}-${item.id}`}>
              {`${idx + 1} ―― ${item.name}  ¥${item.price}  ${type2label[item.type]}`}
            </AlertDialogDescription>
          ))}
          <AlertDialogDescription>
            合計金額: &yen;{order.total}
          </AlertDialogDescription>
          {order.discountInfo.previousOrderId !== null && (
            <AlertDialogDescription>
              割引: -&yen;{order.discountInfo.discount}
            </AlertDialogDescription>
          )}
          <AlertDialogDescription>
            支払金額: &yen;{order.billingAmount}
          </AlertDialogDescription>
          <AlertDialogDescription>
            お預かり金額: &yen;{order.received}
          </AlertDialogDescription>
          <AlertDialogDescription>
            お釣り: &yen;{chargeView}
          </AlertDialogDescription>
          <AlertDialogDescription>
            備考: {order.description}
          </AlertDialogDescription>
          <AlertDialogDescription>
            Tabで選択し、Enterで確定
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>確定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { OrderAlertDialog };