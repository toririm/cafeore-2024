import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, type MetaFunction } from "@remix-run/react";
import useSWRSubscription from "swr/subscription";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { itemConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { itemSchema, itemtypes, type2label } from "~/models/item";

import { type action as clientAction } from "./action";

export { action as clientAction } from "./action";

export const meta: MetaFunction = () => {
  return [{ title: "アイテム" }];
};

export default function Item() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub(itemConverter),
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
    <div className="p-4 font-sans">
      <h1 className="text-3xl">アイテム</h1>
      <ul>
        {items?.map((item) => (
          <li key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.price}</p>
            <p>{item.type}</p>
            <Form method="DELETE">
              <input type="hidden" name="itemId" value={item.id} />
              <Button type="submit">削除</Button>
            </Form>
          </li>
        ))}
      </ul>
      <Form method="POST" id={form.id} onSubmit={form.onSubmit}>
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
