const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Load environment variables relative to this file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Check environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("CRITICAL ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined in the .env file.");
  process.exit(1);
}

// Initialize Firebase Admin
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Firebase Admin loaded from FIREBASE_SERVICE_ACCOUNT environment variable.");
  } else {
    serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    console.log("Firebase Admin loaded from local serviceAccountKey.json file.");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("CRITICAL ERROR: Failed to initialize Firebase Admin SDK.", error.message);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REDIRECT_URI = `http://localhost:${PORT}/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Redirects user to Google Consent Screen
app.get('/auth/google', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).send('userId query parameter is required.');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: userId
  });

  res.redirect(url);
});

// OAuth Callback Receiver
app.get('/auth/google/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('Authorization code and userId (state) are required.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens in Firestore under users/{userId}
    const db = admin.firestore();
    await db.collection('users').doc(userId).set({
      googleCalendarTokens: tokens,
      calendarConnected: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.send(`
      <html>
        <head>
          <title>Calendar Connected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #FFF0E0 0%, #FFE0C0 100%);">
          <div style="padding: 40px; border-radius: 16px; background: #ffffff; box-shadow: 0 10px 25px rgba(128,0,0,0.1); border-left: 8px solid #800000; text-align: center; max-width: 400px; margin: 20px;">
            <div style="font-size: 70px; margin-bottom: 20px;">🛕</div>
            <h1 style="color: #800000; margin: 0 0 10px 0; font-size: 28px;">Temple Alerts</h1>
            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">Calendar Connected!</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">Your Google Calendar is now securely linked to Temple Alerts. You will automatically receive notifications and events.</p>
            <div style="color: #800000; font-weight: bold; background: #FFF0E0; padding: 10px 20px; border-radius: 8px; display: inline-block;">Safe to close this window</div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging OAuth code:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #FFF5F5; margin: 0;">
          <div style="padding: 30px; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 6px solid #D32F2F; text-align: center;">
            <h1 style="color: #D32F2F; margin-top: 0;">Connection Failed</h1>
            <p style="color: #555;">An error occurred while linking your Google Calendar. Please try again.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Check if Calendar is Connected
app.get('/auth/status', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.json({ connected: false });
    }

    const data = doc.data();
    return res.json({ connected: !!(data.calendarConnected && data.googleCalendarTokens) });
  } catch (error) {
    console.error('Error fetching auth status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync Temple Events to user's Google Calendar
app.post('/calendar/sync', async (req, res) => {
  const { userId, events } = req.body;
  if (!userId || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'userId and events array are required.' });
  }

  try {
    const db = admin.firestore();
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User settings not found. Please connect calendar first.' });
    }

    const { googleCalendarTokens } = doc.data();
    if (!googleCalendarTokens) {
      return res.status(400).json({ error: 'Calendar is not connected for this user.' });
    }

    // Initialize Google API Client with saved credentials
    const userAuth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
    userAuth.setCredentials(googleCalendarTokens);

    // Google Calendar service
    const calendar = google.calendar({ version: 'v3', auth: userAuth });

    const syncResults = [];

    for (const evt of events) {
      const { title, description, startTime, endTime } = evt;

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: title,
          description: description || 'Added via Temple Alerts',
          start: {
            dateTime: startTime, // ISO string format
            timeZone: 'Asia/Kolkata'
          },
          end: {
            dateTime: endTime, // ISO string format
            timeZone: 'Asia/Kolkata'
          }
        }
      });
      syncResults.push({ title, eventId: response.data.id });
    }

    // Save updated tokens back to Firestore if they refreshed during the API call
    const currentCredentials = userAuth.credentials;
    if (JSON.stringify(currentCredentials) !== JSON.stringify(googleCalendarTokens)) {
      await db.collection('users').doc(userId).set({
        googleCalendarTokens: currentCredentials
      }, { merge: true });
    }

    res.json({ success: true, synced: syncResults });
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    res.status(500).json({ error: 'Failed to sync calendar events.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
