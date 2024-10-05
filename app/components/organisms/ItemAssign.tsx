import { Pencil2Icon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WithId } from "~/lib/typeguard";
import { cn } from "~/lib/utils";
import { type ItemEntity, type2label } from "~/models/item";
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
const ItemAssign = ({ item, idx, mutateItem, focus, highlight }: props) => {
  const [assignee, setAssinee] = useState<string | null>(null);

  const assignInputRef = useFocusRef(focus);

  const saveAssignInput = useCallback(() => {
    mutateItem(idx, (prev) => {
      const copy = structuredClone(prev);
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
    return highlight ? "Enterで入力" : "　　　　　　　　　　";
  }, [highlight, item.assignee]);

  return (
    <div
      className={cn(
        "grid grid-cols-6 border-l-2 border-white",
        highlight && "border-orange-600",
      )}
    >
      <div className="flex items-center col-span-5">
        <p className="flex-none font-mono font-bold p-3 text-lg">{idx + 1}</p>
        <div className="flex-1">
          <p className="font-bold text-lg">{item.name}</p>
          <p className="text-xs text-stone-500">{type2label[item.type]}</p>
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
                  "w-1/2 flex items-center border-b-2 border-stone-300",
                  highlight && "border-stone-950",
                )}
              >
                {highlight && (
                  <Pencil2Icon className="w-1/6 pr-1 stroke-stone-400" />
                )}
                <p className="flex-none w-5/6 text-stone-400 text-sm">
                  {assignView}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <div className="flex items-center text-right"> */}
      <p className="flex items-center justify-end text-right">
        &yen;{item.price}
      </p>
      {/* </div> */}
    </div>
  );
};

export { ItemAssign };
