import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const contestsCol = collection(db,"contests");

export async function fetchContests() {
  const snap = await getDocs(contestsCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createContest(data: any) {
    const ref = await addDoc(contestsCol, { ...data, createdAt: new Date() });
    return { id: ref.id, ...data }
}

export async function updateContest(id: string, data: any) {
  await updateDoc(doc(db, "contests", id), data);
}

export async function deleteContest(id: string) {
  await deleteDoc(doc(db, "contests", id));
}














// // src/app/services/contests.ts
// import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
// import { db } from "./firebase";

// const contestsCol = collection(db, "contests");          // name of the collection

// export async function fetchContests() {
//   const snap = await getDocs(contestsCol);
//   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
// }

// export async function createContest(data: any) {
//   const ref = await addDoc(contestsCol, { ...data, createdAt: new Date() });
//   return { id: ref.id, ...data };
// }

// export async function updateContest(id: string, data: any) {
//   await updateDoc(doc(db, "contests", id), data);
// }

// export async function deleteContest(id: string) {
//   await deleteDoc(doc(db, "contests", id));
// }