export type WithId<T extends { id?: unknown }> = T &
  Record<"id", NonNullable<T["id"]>>;

export const hasId = <T extends { id?: unknown }>(obj: T): obj is WithId<T> => {
  return obj.id !== undefined && obj.id !== null;
};
