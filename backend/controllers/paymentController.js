// controllers/paymentController.js or inside orderController.js
import axios from 'axios';

export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const userId = req.user.id;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference required' });
    }

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = response.data.data;

    if (data.status === 'success') {
      return res.json({ success: true, amount: data.amount / 100, reference: data.reference });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('PAYSTACK VERIFY ERROR:', error.response?.data || error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};