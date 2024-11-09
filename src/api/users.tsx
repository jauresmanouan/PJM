import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getDb } from "./firebase-config";

export const getUser = async () => {
  const db = getDb();
  if (!db) {
    throw new Error("Firestore is not initialized. This function should be called client-side.");
  }

  const docRef = collection(db, "users");
  const resultat = await getDocs(docRef);

  // Nombre de participants
  const participants = resultat.docs.length;

  // Total quantity
  let totalQuantity = 0;

  resultat.docs.forEach((doc) => {
    const data = doc.data();
    const quantities = data.quantity;
    totalQuantity += quantities;
  });

  return { participants, totalQuantity };
};

export const creatUser = async ({
  newUser,
}: {
  newUser: {
    firstname: string;
    name: string;
    quantity: number | undefined;
    email: string;
    country: string;
    contactMethod: string;
    contact: string;
  };
}) => {
  const db = getDb();
  if (!db) {
    throw new Error("Firestore is not initialized. This function should be called client-side.");
  }

  const docRef = doc(db, "users", newUser.email);
  await setDoc(docRef, newUser);
};
