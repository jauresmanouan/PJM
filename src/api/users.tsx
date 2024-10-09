import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

export const getUser = async () => {
  const docRef = collection(db, "users");
  const resultat = await getDocs(docRef);

  //Nombre de participants
  const participants = resultat.docs.length;

  //Total quantity
  let totalquantity = 0;

  resultat.docs.forEach((doc) => {
    const data = doc.data(); // Récupère les données du document
    const quantities = data.quantity; // Accède à la valeur de quantity
    totalquantity += quantities;
  });

  return { participants, totalquantity };
};
