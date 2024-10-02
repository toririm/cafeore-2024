import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { type2label } from "~/models/item";
import type { OrderEntity } from "~/models/order";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// 確定前にオーダーの内容を表示するダイアログ
const OrderAlertDialog = forwardRef<
  null,
  ComponentPropsWithoutRef<typeof AlertDialog> & {
    order: OrderEntity;
    chargeView: number | string;
    onConfirm: () => void;
  }
>(({ order, chargeView, onConfirm, ...props }) => {
  return (
    <AlertDialog {...props}>
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
          {order.discountOrderId !== null && (
            <AlertDialogDescription>
              割引: -&yen;{order.discount}
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
          <AlertDialogAction onClick={onConfirm}>確定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export { OrderAlertDialog };
