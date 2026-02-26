import { api } from "./api";
import { Book } from "@/types/models/Book";

export const createBook = async (book: Book): Promise<Book> => {
  const response = await api.post<Book>("/book", book);
  return response.data;
};

export const getBooks = async (): Promise<Book[]> => {
  const response = await api.get<Book[]>("/book");
  return response.data;
};
