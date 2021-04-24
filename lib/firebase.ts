import firebase from 'firebase';

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

if (firebase.apps.length == 0) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
}

export const increaseCounter = (field: string) => {
  try {
    firebase.firestore().collection('analytics').doc('links').update({
      [field]: firebase.firestore.FieldValue.increment(1),
    });
  } catch (error) {
    console.error("Error while updating counter", error);
  }
}
