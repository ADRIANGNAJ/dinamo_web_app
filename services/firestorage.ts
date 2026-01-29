import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a logo image to Firebase Storage and returns the download URL.
 * @param file The file object to upload
 * @returns Promise<string> The public download URL
 */
export const uploadLogo = async (file: File): Promise<string> => {
    // Create a reference to 'brand/logo.png' (or use file.name to keep original extension)
    // We use a fixed name 'brand/logo' to overwrite the previous one easily, 
    // ensuring we don't accumulate unused files. 
    // We append a timestamp query param on fetch to bust cache if needed, 
    // but for storage, unique filenames vs fixed filenames is a choice. 
    // Let's use a fixed path for simplicity: 'brand/app-logo'
    const storageRef = ref(storage, 'brand/app-logo');

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};
