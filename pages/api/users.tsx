import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export const getUser = async () => {
  const docRef = collection(db, "users");
  const resultat = await getDocs(docRef);

  //Nombre de participants
  const participants = resultat.docs.length;

  //Total quantity
  let totalQuantity = 0;

  resultat.docs.forEach((doc) => {
    const data = doc.data(); // Récupère les données du document
    const quantities = data.quantity; // Accède à la valeur de quantity
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
  const docRef = doc(db, "users", newUser.email);
  await setDoc(docRef, newUser);
};
