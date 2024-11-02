import type { WithId } from "common/lib/typeguard";
import type { ItemEntity } from "common/models/item";
import { Button } from "../ui/button";

type props = {
  items: WithId<ItemEntity>[];
  addItem: (item: WithId<ItemEntity>) => void;
};

export const ItemButtons = ({ items, addItem }: props) => {
  return (
    <div className="relative h-screen pr-[20px] pl-[20px]">
      <div
        key="hot"
        className="pt-[20px] pb-[15px] pl-[20px] font-medium text-2xl text-theme"
      >
        ブレンド
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-start gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        <Button
          key="q"
          className="h-[50px] w-[150px] bg-theme text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("q"));
          }}
        >
          べっぴんブレンド
        </Button>
        <Button
          key="w"
          className="h-[50px] w-[150px] bg-theme text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("w"));
          }}
        >
          珈琲・俺ブレンド
        </Button>
      </div>
      <div
        key="hot"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl text-theme"
      >
        限定
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-start gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        <Button
          key="e"
          className="h-[50px] w-[150px] bg-theme text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("e"));
          }}
        >
          限定
        </Button>
      </div>
      <div
        key="hot"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl text-hot"
      >
        グルメ
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-start gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        <Button
          key="a"
          className="h-[50px] w-[150px] bg-hot text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("a"));
          }}
        >
          マンデリン
        </Button>
        <Button
          key="s"
          className="h-[50px] w-[150px] bg-hot text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("s"));
          }}
        >
          ピンクブルボン
        </Button>
        <Button
          key="d"
          className="h-[50px] w-[150px] bg-hot text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("d"));
          }}
        >
          コスタリカ
        </Button>
      </div>
      <div
        key="ice"
        className="pt-[30px] pb-[15px] pl-[20px] font-medium text-2xl"
      >
        others
      </div>
      <div
        className="grid grid-cols-3 items-center justify-items-start gap-[30px]"
        style={{ gridTemplateRows: "auto" }}
      >
        <Button
          key="x"
          className="h-[50px] w-[150px] bg-ore text-lg hover:bg-hot hover:ring-4"
          onClick={() => {
            addItem(key2item("x"));
          }}
        >
          ホットオレ
        </Button>
        <Button
          key="c"
          className="h-[50px] w-[150px] bg-ore text-lg hover:bg-ice hover:ring-4"
          onClick={() => {
            addItem(key2item("c"));
          }}
        >
          アイスオレ
        </Button>
        <Button
          key="z"
          className="h-[50px] w-[150px] bg-ice text-lg hover:bg-theme hover:ring-4"
          onClick={() => {
            addItem(key2item("z"));
          }}
        >
          アイスコーヒー
        </Button>
        <Button
          key="v"
          className="h-[50px] w-[150px] bg-ice text-lg hover:bg-ice hover:ring-4"
          onClick={() => {
            addItem(key2item("v"));
          }}
        >
          アイスミルク
        </Button>
        <Button
          key="v"
          className="h-[50px] w-[150px] text-lg hover:ring-4"
          onClick={() => {
            addItem(key2item("v"));
          }}
        >
          コースター
        </Button>
      </div>
    </div>
  );
};
