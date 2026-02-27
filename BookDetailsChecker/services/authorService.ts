import { api } from "./api";
import { Author } from "@/types/models/Author";

export const getAuthorByName = async (name: string): Promise<Author[]> => {
  const response = await api.get<Author[]>(`/author?author_name=${name}`);
  return response.data;
};
export const createAuthor = async (
  authorName: string,
  birthDate?: string,
): Promise<Author> => {
  const payload = {
    author_name: authorName,
    birth_date: birthDate || "1900-01-01",
  };

  const response = await api.post<Author>("/author", payload);
  return response.data;
};
