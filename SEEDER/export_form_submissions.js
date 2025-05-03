const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const COLLECTION_NAME = 'formSubmissions';
async function exportFirestore() {
  const snapshot = await db.collection(COLLECTION_NAME).get();

  const data = snapshot.docs.map(doc => ({
    ...doc.data().data
  }));

  const filePath = path.join(__dirname, `${COLLECTION_NAME}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`Exported ${COLLECTION_NAME} (${data.length} docs) to ${filePath}`);

}

exportFirestore().catch(console.error);
