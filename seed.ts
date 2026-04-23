import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Missing Firebase Admin credentials. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to secrets.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

const getRandomJob = () => {
    const titles = ["Frontend Developer", "Backend Engineer", "Product Manager", "Data Analyst", "UX Designer", "Marketing Specialist", "DevOps Engineer"];
    const companies = ["TechCorp", "Innovatech", "CloudServe", "DataSys", "WebDesign Co", "NextGen Solutions"];
    const locations = ["Addis Ababa", "Remote", "Hawassa", "Dire Dawa", "Mekelle", "Bahir Dar", "Adama"];
    
    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      salary: `${Math.floor(Math.random() * 50 + 20)},000 ETB`,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30 + 10))).toISOString(), // 10 to 40 days from now
      description: "We are looking for an experienced individual to join our growing team. This role offers great opportunities for learning and career advancement.",
      applyMethod: {
        type: Math.random() > 0.5 ? 'telegram' : 'link',
        value: Math.random() > 0.5 ? '@hr_contact' : 'https://example.com/apply'
      },
      status: "Approved",
      employerId: "admin-seed-" + Math.floor(Math.random() * 10000), // Random employer ID for seeded jobs
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
};

async function seed() {
  try {
    for (let i = 0; i < 5; i++) {
        await db.collection("jobs").add(getRandomJob());
    }
    console.log("Successfully seeded 5 jobs!");
  } catch (error) {
    console.error("Error seeding jobs:", error);
  }
}

seed();
