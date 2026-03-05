import { api } from "./api";
import { Language } from "@/types/models/Language";

export const getLanguageByName = async (name: string): Promise<Language[]> => {
  const response = await api.get<Language[]>(
    `/book_language?language_name=${name}`,
  );
  return response.data;
};

export const createLanguage = async (name: string): Promise<Language> => {
  const response = await api.post<Language>("/book_language", {
    language_name: name,
    language_code: name.substring(0, 2).toUpperCase(),
  });
  return response.data;
};
