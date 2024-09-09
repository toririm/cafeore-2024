import { useLoaderData, type ClientLoaderFunction } from "@remix-run/react";

export const useClientLoaderData = <T extends ClientLoaderFunction>(): Awaited<
  ReturnType<T>
> => useLoaderData<T>() as Awaited<ReturnType<T>>;
