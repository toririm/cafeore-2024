import { type ClientActionFunction } from "@remix-run/react";

export const deleteItem: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const itemId = formData.get("itemId");

  // todo: implement delete item
  console.error("Not implemented: delete item", itemId);

  return new Response(null, { status: 204 });
};
