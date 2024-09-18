import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Form,
  useActionData,
  useNavigation,
  type MetaFunction,
} from "@remix-run/react";
import { useMemo } from "react";
import useSWRSubscription from "swr/subscription";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { itemConverter } from "~/firebase/converter";
import { collectionSub } from "~/firebase/subscription";
import { itemSchema, itemtypes, type2label } from "~/models/item";
// Add these imports
import type { ItemEntity, ItemType } from "~/models/item"; // Adjust the path as needed

import { type addItem } from "./actions/addItem";

export { action as clientAction } from "./action";

export const meta: MetaFunction = () => {
  return [{ title: "アイテム" }];
};

export default function Item() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub({ converter: itemConverter }),
  );
  const navigation = useNavigation();
  const lastResult = useActionData<typeof addItem>();
  const [form, fields] = useForm({
    lastResult: navigation.state === "idle" ? lastResult : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: itemSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Sort and group items by type
  const sortedItems = useMemo<Record<ItemType, ItemEntity[]>>(() => {
    const base = { hot: [], ice: [], ore: [], milk: [] };
    if (!items) return base;
    return items.reduce<Record<ItemType, ItemEntity[]>>((acc, item) => {
      acc[item.type].push(item);
      return acc;
    }, base);
  }, [items]);

  return (
    <div className="font-sans p-4 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">アイテム管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            新規アイテム登録
          </h2>
          <Form
            method="POST"
            id={form.id}
            onSubmit={form.onSubmit}
            className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200"
          >
            <div>
              <Label htmlFor={fields.name.id} className="text-gray-700">
                名前
              </Label>
              <Input
                type="text"
                id={fields.name.id}
                key={fields.name.key}
                name={fields.name.name}
                defaultValue={fields.name.initialValue}
                required
                placeholder="アイテム名"
                className="w-full mt-1"
              />
              {fields.name.errors && (
                <span className="text-red-500 text-sm">
                  {fields.name.errors}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor={fields.price.id} className="text-gray-700">
                価格
              </Label>
              <Input
                type="number"
                id={fields.price.id}
                key={fields.price.key}
                name={fields.price.name}
                defaultValue={fields.price.initialValue}
                required
                placeholder="価格"
                className="w-full mt-1"
              />
              {fields.price.errors && (
                <span className="text-red-500 text-sm">
                  {fields.price.errors}
                </span>
              )}
            </div>
            <div>
              <Label className="text-gray-700">タイプ</Label>
              <RadioGroup
                key={fields.type.key}
                name={fields.type.name}
                defaultValue={fields.type.initialValue}
                className="mt-2"
              >
                {itemtypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type}>{type2label[type]}</Label>
                  </div>
                ))}
              </RadioGroup>
              {fields.type.errors && (
                <span className="text-red-500 text-sm">
                  {fields.type.errors}
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              登録
            </Button>
          </Form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            登録済みアイテム
          </h2>
          {itemtypes.map((type) => (
            <div key={type} className="mb-6">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">
                {type2label[type]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedItems[type]?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden border border-gray-200"
                  >
                    <div className="bg-purple-100 p-4">
                      <h4 className="text-lg font-medium text-purple-800">
                        {item.name}
                      </h4>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600">
                        価格: ¥{item.price.toLocaleString()}
                      </p>
                      <Form method="DELETE" className="mt-2">
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button
                          type="submit"
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          削除
                        </Button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
