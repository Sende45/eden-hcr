import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Importation de ton instance configurée
import { storage } from '../config/firebase'; 

export const uploadFileToFirebase = async (file: File, folder: string): Promise<string> => {
  try {
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`[Firebase] Échec du téléversement de ${file.name}:`, error);
    throw new Error("Échec du stockage des documents réglementaires.");
  }
};