import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";

export async function saveOrder(order) {
  try {
    // Serialize the order data to ensure compatibility with Firebase
    const serializedOrder = JSON.parse(JSON.stringify(order));
    const docRef = await addDoc(collection(db, "orders"), serializedOrder);
    console.log("Order saved with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}
