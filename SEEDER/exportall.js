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

async function exportFirestore() {
  const collections = await db.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filePath = path.join(__dirname, `${collection.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Exported ${collection.id} (${data.length} docs) to ${filePath}`);
  }
}

exportFirestore().catch(console.error);
