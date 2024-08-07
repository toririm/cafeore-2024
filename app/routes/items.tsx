import type { MetaFunction } from "@remix-run/node";
import useSWRSubscription from "swr/subscription";
import { collectionSub } from "~/firebase/subscription";

export const meta: MetaFunction = () => {
  return [{ title: "アイテム" }];
};

export default function Item() {
  const { data: items } = useSWRSubscription("items", collectionSub);

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">アイテム</h1>
      <ul>
        {items?.map((item) => (
          <li key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.price}</p>
            <p>{item.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
