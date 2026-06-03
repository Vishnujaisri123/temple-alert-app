const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log("Testing Firestore write...");
db.collection("test").doc("connection-test").set({
  status: "success",
  timestamp: new Date()
})
.then(() => {
  console.log("SUCCESS: Firestore is initialized and write succeeded!");
  process.exit(0);
})
.catch((error) => {
  console.error("ERROR: Firestore write failed!", error.message);
  process.exit(1);
});
