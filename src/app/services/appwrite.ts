import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69ec85ee00105396979f';
export const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID || '69ec8871002bec20d3fc';
export const APPWRITE_STORAGE_ID = import.meta.env.VITE_APPWRITE_STORAGE_ID || '69ec88dc0031491953ae';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

// We will export the collection IDs here once they are created
// export const COLLECTIONS = {
//   QUESTIONS: 'questions_id',
//   CONTESTS: 'contests_id',
//   SUBMISSIONS: 'submissions_id',
// };
