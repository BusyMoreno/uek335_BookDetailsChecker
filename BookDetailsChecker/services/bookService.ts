import { api } from "./api";
import { Book } from "@/types/models/Book";

export const createBook = async (book: Book): Promise<Book> => {
  const response = await api.post<Book>("/book", book);
  return response.data;
};

export const getBooks = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  titleSearch?: string;
}): Promise<{ books: Book[]; total: number }> => {
  const query: Record<string, string | number> = {};

  if (params?.page) query._page = params.page;
  if (params?.limit) query._limit = params.limit;
  if (params?.sort) query._sort = params.sort;
  if (params?.order) query._order = params.order;
  if (params?.titleSearch) query.title_like = params.titleSearch;

  const response = await api.get<Book[]>("/book", { params: query });
  const total = Number(response.headers["x-total-count"]) || response.data.length;

  return { books: response.data, total };
};

export const getBookById = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/book/${id}`);
  return response.data;
};



export { Book };