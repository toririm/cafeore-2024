export type Repository<T> = {
  findAll: () => Promise<T[]>;
  findById: (id: string) => Promise<T | null>;
  create: (data: T) => Promise<void>;
  update: (data: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
};
