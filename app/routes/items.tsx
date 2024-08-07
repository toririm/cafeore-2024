import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { addDoc, collection } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { db } from "~/firebase/firestore";
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
      <Form method="post">
        <Input type="text" name="name" placeholder="名前" />
        <Input type="number" name="price" placeholder="価格" />
        <RadioGroup name="type">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hot" id="hot" />
            <Label htmlFor="hot">ホット</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ice" id="ice" />
            <Label htmlFor="ice">アイス</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ore" id="ore" />
            <Label htmlFor="ore">オレ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="milk" id="milk" />
            <Label htmlFor="milk">ミルク</Label>
          </div>
        </RadioGroup>
        <Button type="submit">登録</Button>
      </Form>
    </div>
  );
}

export const clientAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const price = formData.get("price");
  const type = formData.get("type");

  // あとでマシなバリデーションにする e.g. zod, conform
  if (!(name && price && type)) {
    return new Response("Bad Request", { status: 400 });
  }

  // あとでマシなエラーハンドリングにする & 処理を別ファイルに切り分ける
  const docRef = await addDoc(collection(db, "items"), {
    name,
    price: Number(price),
    type,
  });

  console.log("Document written with ID: ", docRef.id);
  return new Response(null, { status: 204 });
};
