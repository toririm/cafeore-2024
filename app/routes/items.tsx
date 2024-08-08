import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
import { addDoc, collection } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { db } from "~/firebase/firestore";
import { collectionSub } from "~/firebase/subscription";
import { itemSchema, itemtypes } from "~/models/item";

export const meta: MetaFunction = () => {
  return [{ title: "アイテム" }];
};

const type2label = {
  hot: "ホット",
  ice: "アイス",
  ore: "オレ",
  milk: "ミルク",
};

export default function Item() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub(itemSchema),
  );
  const lastResult = useActionData<typeof clientAction>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: itemSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">アイテム</h1>
      <ul>
        {items?.map((item) => (
          <li key={item.name}>
            <h2>{item.name}</h2>
            <p>{item.price}</p>
            <p>{item.type}</p>
          </li>
        ))}
      </ul>
      <Form method="post" id={form.id} onSubmit={form.onSubmit}>
        <div>
          <Input
            type="text"
            key={fields.name.key}
            name={fields.name.name}
            defaultValue={fields.name.initialValue}
            required
            placeholder="名前"
          />
          <span>{fields.name.errors}</span>
        </div>
        <div>
          <Input
            type="number"
            key={fields.price.key}
            name={fields.price.name}
            defaultValue={fields.price.initialValue}
            required
            placeholder="価格"
          />
          <span>{fields.price.errors}</span>
        </div>
        <div>
          <RadioGroup
            key={fields.type.key}
            name={fields.type.name}
            defaultValue={fields.type.initialValue}
          >
            {itemtypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type}>{type2label[type]}</Label>
              </div>
            ))}
          </RadioGroup>
          <span>{fields.type.errors}</span>
        </div>
        <Button type="submit">登録</Button>
      </Form>
    </div>
  );
}

export const clientAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: itemSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { name, price, type } = submission.value;

  // あとでマシなエラーハンドリングにする & 処理を別ファイルに切り分ける
  const docRef = await addDoc(collection(db, "items"), {
    name,
    price: Number(price),
    type,
  });

  console.log("Document written with ID: ", docRef.id);
  return new Response(null, { status: 204 });
};
