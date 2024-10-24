import { useSubmit } from "@remix-run/react";
import type { WithId } from "common/lib/typeguard";
import type { Author, OrderEntity } from "common/models/order";
import { useCallback, useState } from "react";
import { Input } from "../ui/input";

export const InputComment = ({
  order,
  author,
}: { order: WithId<OrderEntity>; author: Author }) => {
  const submit = useSubmit();
  const [descComment, setDescComment] = useState("");
  const submitComment = useCallback(
    (servedOrder: OrderEntity, author: Author, descComment: string) => {
      const order = servedOrder.clone();
      order.addComment(author, descComment);
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
        placeholder="コメント"
        onChange={(e) => {
          setDescComment(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitComment(order, author, descComment);
            setDescComment("");
          }
        }}
      />
    </div>
  );
};
