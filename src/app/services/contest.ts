import { ID, Query } from "appwrite";
import { databases, APPWRITE_DB_ID } from "./appwrite";

const COLLECTION_ID = "contests";

export type Contest = {
  id: string;
  name: string;
  description?: string;
  registeredParticipants?: number;
  problems?: number;
  antiCheat?: any;
  startTime: string;
  endTime?: string;
  status?: string;
  question_ids?: string[];
};

export const fetchContests = async (): Promise<Contest[]> => {
  try {
    const response = await databases.listDocuments(APPWRITE_DB_ID, COLLECTION_ID, [
      Query.orderDesc("$createdAt")
    ]);

    return response.documents.map(doc => {
      let antiCheat = doc.anti_cheat;
      if (typeof antiCheat === "string") {
        try { antiCheat = JSON.parse(antiCheat); } catch(e) {}
      }

      let questionIds = doc.question_ids;
      if (typeof questionIds === "string") {
        try { questionIds = JSON.parse(questionIds); } catch(e) {}
      }

      return {
        id: doc.$id,
        name: doc.name,
        startTime: doc.start_time,
        endTime: doc.end_time,
        problems: doc.problems,
        antiCheat,
        question_ids: questionIds,
        status: getStatus(doc.start_time, doc.end_time),
      } as Contest;
    });
  } catch (error) {
    console.error("Appwrite fetchContests error:", error);
    return [];
  }
};

function getStatus(start: string, end: string) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);

  if (now < startTime) return "Upcoming";
  if (now > endTime) return "Ended";
  return "Live";
}

export async function createContest(data: any) {
    const payload = {
      ...data,
      startTime: data.start_time,
      endTime: data.end_time,
      anti_cheat: typeof data.anti_cheat === 'object' ? JSON.stringify(data.anti_cheat) : data.anti_cheat,
      question_ids: Array.isArray(data.question_ids) ? JSON.stringify(data.question_ids) : data.question_ids,
      createdAt: new Date().toISOString()
    };
    const response = await databases.createDocument(APPWRITE_DB_ID, COLLECTION_ID, ID.unique(), payload);
    return { id: response.$id, ...data };
}

export async function updateContest(id: string, data: any) {
  const payload = {
    ...data,
    startTime: data.start_time,
    endTime: data.end_time,
    anti_cheat: typeof data.anti_cheat === 'object' ? JSON.stringify(data.anti_cheat) : data.anti_cheat,
    question_ids: Array.isArray(data.question_ids) ? JSON.stringify(data.question_ids) : data.question_ids,
    updatedAt: new Date().toISOString()
  };
  await databases.updateDocument(APPWRITE_DB_ID, COLLECTION_ID, id, payload);
}

export async function deleteContest(id: string) {
  await databases.deleteDocument(APPWRITE_DB_ID, COLLECTION_ID, id);
}