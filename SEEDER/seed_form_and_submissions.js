const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const FORM_CONFIG_COLLECTION = 'formConfigs';
const FORM_SUBMISSION_COLLECTION = 'formSubmissions';

// Sample field definitions for 5 different forms
const formTemplates = [
  {
    config: {
      title: 'Employee Information',
      elements: [
        { type: 'text', label: 'Name', name: 'name', required: true },
        { type: 'select', label: 'Gender', name: 'gender', required: true, options: ['Male', 'Female', 'Other'] },
        { type: 'number', label: 'Salary', name: 'salary', required: true }
      ]
    }
  },
  {
    config: {
      title: 'Profile Form',
      elements: [
        { type: 'text', label: 'Name', name: 'name', required: true },
        { type: 'text', label: 'Email', name: 'email', required: true },
        { type: 'text', label: 'Company', name: 'company', required: false },
        { type: 'number', label: 'Age', name: 'age', required: true },
        { type: 'select', label: 'Education', name: 'education', required: false, options: ['High School', 'Bachelors', 'Masters', 'PhD'] }
      ]
    }
  },
  {
    config: {
      title: 'Feedback Form',
      elements: [
        { type: 'text', label: 'Name', name: 'name', required: true },
        { type: 'text', label: 'Feedback', name: 'feedback', required: false },
        { type: 'number', label: 'Rating', name: 'rating', required: true }
      ]
    }
  }
];

// Generate mock data matching field types
function generateFieldData(field) {
  if (field.type === 'text') {
    const samples = ['John', 'Jane', 'Test', 'Foo', 'Bar', 'Alice', 'Bob', 'Carlos', 'Rahul', 'Harsh', 'kashish', 'pankaj'];
    return samples[Math.floor(Math.random() * samples.length)];
  }
  if (field.type === 'number') {
    return Math.floor(Math.random() * 100) + 1;
  }
  if (field.type === 'select' && field.options) {
    return field.options[Math.floor(Math.random() * field.options.length)];
  }
  return null;
}

// Seed one form config + 100 submissions
async function seedFormAndSubmissions(templateIndex) {
  const formTemplate = formTemplates[templateIndex];
  const docRef = db.collection(FORM_CONFIG_COLLECTION).doc(); // Auto-ID

  const formConfig = {
    id: docRef.id,
    createdAt: admin.firestore.Timestamp.now(),
    lastModified: admin.firestore.Timestamp.now(),
    config: formTemplate.config,
  };

  // Save form config
  await docRef.set(formConfig);
  console.log(`Form ${templateIndex + 1} seeded: ${docRef.id}`);

  // Seed 100 submissions
  const batchSize = 100; // Firestore limit per batch
  let batch = db.batch();
  let counter = 0;

  for (let i = 0; i < 5; i++) {
    const subRef = db.collection(FORM_SUBMISSION_COLLECTION).doc();

    const data = {};
    for (const field of formTemplate.config.elements) {
      data[field.name] = generateFieldData(field);
    }

    const submission = {
      id: subRef.id,
      formId: docRef.id,
      data,
      durationMs: Math.floor(Math.random() * 20000) + 1000,
      submittedAt: admin.firestore.Timestamp.now()
    };

    batch.set(subRef, submission);
    counter++;

    // Commit in batches of 500
    if (counter % batchSize === 0 || i === 99) {
      await batch.commit();
      batch = db.batch();
    }
  }

  console.log(`100 submissions seeded for formId: ${docRef.id}`);
}

// Main function to run everything
(async () => {
  for (let i = 0; i < formTemplates.length; i++) {
    await seedFormAndSubmissions(i);
  }

  console.log('✅ Done seeding 5 forms and 500 total submissions.');
})();
