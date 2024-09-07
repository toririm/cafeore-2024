export const hasId = <T extends { id?: unknown }>(
  obj: T,
): obj is T & Record<"id", NonNullable<T["id"]>> => {
  return (obj as any).id !== undefined;
};
