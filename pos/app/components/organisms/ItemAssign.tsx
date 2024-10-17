import { Pencil2Icon } from "@radix-ui/react-icons";
import type { WithId } from "common/lib/typeguard";
import { type ItemEntity, type2label } from "common/models/item";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";
import { useFocusRef } from "../functional/useFocusRef";
import { Input } from "../ui/input";

type props = {
  item: WithId<ItemEntity>;
  idx: number;
  mutateItem: (
    idx: number,
    action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>,
  ) => void;
  highlight: boolean;
  focus: boolean;
};

/**
 * Enterでアサイン入力欄を開けて、アイテムのアサインを変更できるコンポーネント
 */
const ItemAssign = memo(
  ({ item, idx, mutateItem, focus, highlight }: props) => {
    const [assignee, setAssinee] = useState<string | null>(null);

    const assignInputRef = useFocusRef<HTMLInputElement>(focus);

    const saveAssignInput = useCallback(() => {
      mutateItem(idx, (prev) => {
        const copy = prev.clone();
        copy.assignee = assignee;
        return copy;
      });
    }, [assignee, idx, mutateItem]);

    // アサイン入力欄を閉じるときに保存
    useEffect(() => {
      if (!focus) {
        saveAssignInput();
      }
    }, [focus, saveAssignInput]);

    const assignView = useMemo(() => {
      if (item.assignee) return item.assignee;
      return highlight ? "Enterで入力" : "　";
    }, [highlight, item.assignee]);

    return (
      <div
        className={cn(
          "grid grid-cols-6 border-white border-l-2",
          highlight && "border-orange-600",
        )}
      >
        <div className="col-span-5 flex items-center">
          <p className="flex-none p-3 font-bold font-mono text-lg">{idx + 1}</p>
          <div className="flex-1">
            <p className="font-bold text-lg">{item.name}</p>
            <p className="text-stone-500 text-xs">{type2label[item.type]}</p>
            <div className="flex justify-end">
              {focus ? (
                <Input
                  ref={assignInputRef}
                  value={assignee ?? ""}
                  onChange={(e) => setAssinee(e.target.value || null)}
                  placeholder="指名"
                  className="h-6 w-1/2 border-stone-300 border-b-2 text-sm"
                />
              ) : (
                <div
                  className={cn(
                    "flex w-1/2 items-center border-stone-300 border-b-2",
                    highlight && "border-stone-950",
                  )}
                >
                  {highlight && (
                    <Pencil2Icon className="w-1/6 stroke-stone-400 pr-1" />
                  )}
                  <p className="w-5/6 flex-none text-sm text-stone-400">
                    {assignView}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="flex items-center justify-end text-right">
          &yen;{item.price}
        </p>
      </div>
    );
  },
);

export { ItemAssign };
