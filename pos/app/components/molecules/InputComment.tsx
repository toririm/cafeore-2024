import { useSubmit } from "@remix-run/react";
import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import { useCallback, useState } from "react";
import { Input } from "../ui/input";

export const InputComment = ({ order }: { order: WithId<OrderEntity> }) => {
  const submit = useSubmit();
  const [descComment, setDescComment] = useState("");
  const submitComment = useCallback(
    (servedOrder: OrderEntity, descComment: string) => {
      const order = servedOrder.clone();
      order.addComment("master", descComment);
      submit(
        { servedOrder: JSON.stringify(order.toOrder()) },
        { method: "PUT" },
      );
    },
    [submit],
  );
  return (
    <div className="my-2">
      <Input
        id="comment"
        name="comment"
        type="string"
        value={descComment}
        placeholder="追記事項"
        onChange={(e) => {
          setDescComment(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitComment(order, descComment);
            setDescComment("");
          }
        }}
      />
    </div>
  );
};
