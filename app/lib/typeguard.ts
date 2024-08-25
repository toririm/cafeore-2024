export const hasId = <T>(obj: T): obj is Required<T> => {
  return (obj as any).id !== undefined;
};
