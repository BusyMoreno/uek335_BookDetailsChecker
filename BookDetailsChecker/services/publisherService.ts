import { api } from "./api";
import { Publisher } from "@/types/models/Publisher";

export const getPublisherByName = async (
  name: string,
): Promise<Publisher[]> => {
  const response = await api.get<Publisher[]>(
    `/publisher?publisher_name=${name}`,
  );
  return response.data;
};

export const createPublisher = async (name: string): Promise<Publisher> => {
  const response = await api.post<Publisher>("/publisher", {
    publisher_name: name,
  });
  return response.data;
};
