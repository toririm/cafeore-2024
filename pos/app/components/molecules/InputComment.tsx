import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import { useState } from "react";
import { Input } from "../ui/input";

type props = {
  order: WithId<OrderEntity>;
  mutateOrder: (order: WithId<OrderEntity>, descComment: string) => void; // これをコンポーネントの中で呼び出す
};

export const InputComment = ({ order, mutateOrder }: props) => {
  const [descComment, setDescComment] = useState("");

  return (
    <div className="my-2">
      <Input
        id="comment"
        name="comment"
        type="string"
        value={descComment}
        placeholder="追記"
        onChange={(e) => {
          setDescComment(e.target.value);
        }}
        onKeyDown={(e) => {
          // MacOSではIME確定時のEnterでもkey === "Enter"が発火してしまう
          // deprecatedではあるがkeyCodeを使う
          if (e.keyCode === 13) {
            mutateOrder(order, descComment);
            setDescComment("");
          }
        }}
      />
    </div>
  );
};
