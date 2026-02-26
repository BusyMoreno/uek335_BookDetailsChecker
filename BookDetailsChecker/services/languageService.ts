import { api } from "./api";
import { Language } from "@/types/models/Language";

export const getLanguageByCode = async (code: string): Promise<Language[]> => {
  const response = await api.get<Language[]>(
    `/book_language?language_code=${code}`,
  );
  return response.data;
};

export const createLanguage = async (code: string): Promise<Language> => {
  const response = await api.post<Language>("/book_language", {
    language_code: code,
  });
  return response.data;
};
