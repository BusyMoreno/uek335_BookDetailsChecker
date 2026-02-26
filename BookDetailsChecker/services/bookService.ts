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

export const getBookById = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/book/${id}`);
  return response.data;
};


export const getAuthorsForBook = async (
  bookId: number
): Promise<{ id: number; name: string }[]> => {
const response = await api.get<{ id: number; name: string }[]>(`/book_author?book_id=${bookId}`);
  return response.data;
};