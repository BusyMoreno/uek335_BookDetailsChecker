import { api } from "./api";
import { Author } from "@/types/models/Author";

export const getAuthorByName = async (name: string): Promise<Author[]> => {
  const response = await api.get<Author[]>(`/author?name=${name}`);
  return response.data;
};

export const createAuthor = async (name: string): Promise<Author> => {
  const response = await api.post<Author>("/author", { name });
  return response.data;
};
