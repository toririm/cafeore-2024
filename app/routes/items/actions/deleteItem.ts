import { parseWithZod } from "@conform-to/zod";
import { json, type ClientActionFunction } from "@remix-run/react";
import { z } from "zod";

import { itemRepository } from "~/repositories/item";

export const deleteItem: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: z.object({ itemId: z.string() }),
  });

  if (submission.status !== "success") {
    console.error("Invalid form data", submission.reply());
    return json(submission.reply(), { status: 400 });
  }

  const { itemId } = submission.value;

  await itemRepository.delete(itemId);

  return new Response(null, { status: 204 });
};
