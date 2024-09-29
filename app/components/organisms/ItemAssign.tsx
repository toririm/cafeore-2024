import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input } from "~/components/ui/input";
import type { WithId } from "~/lib/typeguard";
import { cn } from "~/lib/utils";
import { type ItemEntity, type2label } from "~/models/item";

type props = {
  item: WithId<ItemEntity>;
  idx: number;
  setOrderItems: Dispatch<SetStateAction<WithId<ItemEntity>[]>>;
  focus: boolean;
};

const ItemAssign = ({ item, idx, setOrderItems, focus }: props) => {
  const [edit, setEdit] = useState(false);
  const [assignee, setAssinee] = useState<string | null>(null);

  const assignInputRef = useRef<HTMLInputElement>(null);

  const closeAssignInput = useCallback(() => {
    setOrderItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[idx].assignee = assignee;
      return newItems;
    });
    setEdit(false);
  }, [idx, assignee, setOrderItems]);

  const change = useCallback(() => {
    if (edit) {
      closeAssignInput();
    } else {
      setEdit(true);
    }
  }, [edit, closeAssignInput]);

  useEffect(() => {
    if (!focus) {
      closeAssignInput();
    }
  }, [focus, closeAssignInput]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        change();
      }
    };
    if (focus) {
      window.addEventListener("keydown", handler);
    }
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [focus, change]);

  useEffect(() => {
    if (edit) {
      assignInputRef.current?.focus();
    }
  }, [edit]);

  return (
    <div className={cn("grid grid-cols-2", focus && "bg-orange-500")}>
      <p className="font-bold text-lg">{idx + 1}</p>
      <div>
        <p>{item.name}</p>
        <p>{item.price}</p>
        <p>{type2label[item.type]}</p>
        {edit ? (
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
