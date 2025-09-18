import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";

export async function saveOrder(order) {
  try {
    const docRef = await addDoc(collection(db, "orders"), order);
    console.log("Order saved with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}
