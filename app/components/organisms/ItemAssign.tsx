import { useCallback, useEffect, useRef, useState } from "react";
import type { WithId } from "~/lib/typeguard";
import { cn } from "~/lib/utils";
import { type ItemEntity, type2label } from "~/models/item";
import { Input } from "../ui/input";

type props = {
  item: WithId<ItemEntity>;
  idx: number;
  mutateItem: (
    idx: number,
    action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>,
  ) => void;
  focus: boolean;
};

/**
 * Enterでアサイン入力欄を開けて、アイテムのアサインを変更できるコンポーネント
 */
const ItemAssign = ({ item, idx, mutateItem, focus }: props) => {
  const [editable, setEditable] = useState(false);
  const [assignee, setAssinee] = useState<string | null>(null);

  const assignInputRef = useRef<HTMLInputElement>(null);

  const closeAssignInput = useCallback(() => {
    mutateItem(idx, (prev) => {
      const copy = structuredClone(prev);
      copy.assignee = assignee;
      return copy;
    });
    setEditable(false);
  }, [assignee, idx, mutateItem]);

  // edit の状態に応じて assign 入力欄を開くか閉じる
  const switchEditable = useCallback(() => {
    if (editable) {
      closeAssignInput();
    } else {
      setEditable(true);
    }
  }, [editable, closeAssignInput]);

  // focus が変化したときに assign 入力欄を閉じる
  useEffect(() => {
    if (!focus && editable) {
      closeAssignInput();
    }
  }, [focus, editable, closeAssignInput]);

  // Enter が押されたときに assign 入力欄を開く
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        switchEditable();
      }
    };
    if (focus) {
      window.addEventListener("keydown", handler);
    }
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [focus, switchEditable]);

  // edit が true に変化したとき assign 入力欄にフォーカスする
  useEffect(() => {
    if (editable) {
      assignInputRef.current?.focus();
    }
  }, [editable]);

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
