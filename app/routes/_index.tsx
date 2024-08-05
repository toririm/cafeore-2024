import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "~/components/ui/button";
import { db } from "~/firebase/firestore";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export const clientLoader = async () => {
  // clientLoader は Remix SPA 特有の関数で、ページロード時にクライアント側で実行される
  // したがって現時点ではリアルタイムデータの取得はできない
  const itemsRef = collection(db, "items");
  const docSnap = await getDocs(itemsRef);
  const items = docSnap.docs.map((doc) => doc.data());
  console.log(items);
  return { items };
};

export default function Index() {
  const { items } = useLoaderData<typeof clientLoader>();

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Remix (SPA Mode)</h1>
      <ul className="list-disc mt-4 pl-6 space-y-2">
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/guides/spa-mode"
            rel="noreferrer"
          >
            SPA Mode Guide
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/docs"
            rel="noreferrer"
          >
            Remix Docs
          </a>
        </li>
      </ul>
      <Button className="mt-4 bg-sky-900 text-white">Click me</Button>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="mt-4">
            <h2 className="text-xl">{item.name}</h2>
            <p>{item.price}</p>
            <p>{item.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
