import type { WithId } from "common/lib/typeguard";
import type { ItemEntity } from "common/models/item";
import { Button } from "../ui/button";

type props = {
  items: WithId<ItemEntity>[];
  addItem: (item: WithId<ItemEntity>) => void;
};

export const ItemButtons = ({ items, addItem }: props) => {
  return (
    <div className="relative w-2/3 pr-[20px] pl-[20px]">
      <div
        key="hot"
        className="pb-[15px] pl-[20px] font-medium text-2xl text-hot"
      >
        ホット
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-center gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        {items.map(
          (item) =>
            item.type === "hot" && (
              <Button
                key={item.id}
                className="h-[50px] w-[200px] bg-hot text-lg hover:bg-theme hover:ring-4 hover:ring-theme"
                onClick={() => addItem(item)}
              >
                {item.name}
              </Button>
            ),
        )}
      </div>
      <div
        key="ice"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl text-ice"
      >
        アイス
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-center gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        {items.map(
          (item) =>
            (item.type === "ice" || item.type === "milk") && (
              <Button
                key={item.id}
                className="h-[50px] w-[200px] bg-ice text-lg hover:bg-theme hover:ring-4 hover:ring-theme"
                onClick={() => addItem(item)}
              >
                {item.name}
              </Button>
            ),
        )}
      </div>
      <div
        key="ore"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl text-ore"
      >
        オレ
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-center gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        {items.map(
          (item) =>
            (item.type === "hotOre" || item.type === "iceOre") && (
              <Button
                key={item.id}
                className="h-[50px] w-[200px] bg-ore text-lg hover:bg-theme hover:ring-4 hover:ring-theme"
                onClick={async () => addItem(item)}
              >
                {item.name}
              </Button>
            ),
        )}
      </div>
      <div
        key="others"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl"
      >
        その他
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-center gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        {items.map(
          (item) =>
            item.type === "others" && (
              <Button
                key={item.id}
                className="h-[50px] w-[200px] text-lg hover:bg-theme hover:ring-4 hover:ring-theme"
                onClick={() => addItem(item)}
              >
                {item.name}
              </Button>
            ),
        )}
      </div>
    </div>
  );
};
