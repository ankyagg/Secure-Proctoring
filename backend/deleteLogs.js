const db = require('./firebase');

async function clearCollection(collectionPath) {
  try {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log(`No documents found in '${collectionPath}'.`);
      return;
    }

    const batchSize = 500;
    let count = 0;

    for (const doc of snapshot.docs) {
      await doc.ref.delete();
      count++;
      if (count % batchSize === 0) {
          console.log(`Deleted ${count} documents...`);
      }
    }

    console.log(`Successfully deleted ${count} documents from '${collectionPath}'.`);
  } catch (error) {
    console.error('Error clearing collection:', error);
  }
}

clearCollection('proctor_logs');
