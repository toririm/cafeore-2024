import { parseWithZod } from "@conform-to/zod";
import { type ClientActionFunction, json } from "@remix-run/react";

import { itemSchema } from "~/models/item";
import { itemRepository } from "~/repositories/item";

export const addItem: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: itemSchema });

  if (submission.status !== "success") {
    console.error("Invalid form data", submission.reply());
    return json(submission.reply(), { status: 400 });
  }

  const newItem = submission.value;
  const savedItem = await itemRepository.save(newItem);

  console.log("Document written with ID: ", savedItem.id);
  return new Response(null, { status: 204 });
};
