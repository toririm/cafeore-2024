import { useSearchParams } from "@remix-run/react";
import { orderConverter } from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import useSWRSubscription from "swr/subscription";

export default function Welcome() {
  const [searchParam, setSearchParam] = useSearchParams();
  const id = searchParam.get("id");
  if (!id) {
    return <div>Missing ID</div>;
  }

  const order = useSWRSubscription(
    ["orders", id],
    documentSub({ converter: orderConverter }),
  );

  return (
    <div>
      <code>{JSON.stringify(order.data?.toOrder(), null, 2)}</code>
    </div>
  );
}
