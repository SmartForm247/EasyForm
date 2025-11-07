import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const app = express();
app.use(bodyParser.json());

app.post('/verify-payment', async (req, res) => {
  const { reference, uid, credits } = req.body;
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      // update user credits
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      const prevCredits = userDoc.exists ? userDoc.data().credits || 0 : 0;
      await userRef.set({ credits: prevCredits + credits }, { merge: true });
      return res.json({ status: 'success' });
    } else {
      return res.json({ status: 'failed', details: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
