import { useCallback, useEffect, useState } from "react";
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
  editable: boolean;
  focus: boolean;
};

/**
 * Enterでアサイン入力欄を開けて、アイテムのアサインを変更できるコンポーネント
 */
const ItemAssign = ({ item, idx, mutateItem, editable, focus }: props) => {
  const [assignee, setAssinee] = useState<string | null>(null);

  const assignInputRef = useFocusRef(editable);

  const saveAssignInput = useCallback(() => {
    mutateItem(idx, (prev) => {
      const copy = structuredClone(prev);
      copy.assignee = assignee;
      return copy;
    });
  }, [assignee, idx, mutateItem]);

  useEffect(() => {
    if (!editable) {
      saveAssignInput();
    }
  }, [editable, saveAssignInput]);

  return (
    <div className={cn("grid grid-cols-2", focus && "bg-orange-500")}>
      <p className="font-bold text-lg">{idx + 1}</p>
      <div>
        <p>{item.name}</p>
        <p>{item.price}</p>
        <p>{type2label[item.type]}</p>
        {editable ? (
          <Input
            ref={assignInputRef}
            value={assignee ?? ""}
            onChange={(e) => setAssinee(e.target.value || null)}
            placeholder="指名"
          />
        ) : (
          <p>{item.assignee ?? "指名なし"}</p>
        )}
      </div>
    </div>
  );
};

export { ItemAssign };
