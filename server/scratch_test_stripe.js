import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const testStripe = async () => {
  try {
    const session = await stripeInstance.checkout.sessions.create({
      success_url: 'http://localhost:5174/success',
      cancel_url: 'http://localhost:5174/cancel',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'QuickShow Movie Ticket',
              description: 'Batman v Superman • 2 Tickets (Seats: A1, A2)',
            },
            unit_amount: 50000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });
    console.log("SUCCESS! Stripe Session URL:", session.url);
  } catch (error) {
    console.error("STRIPE TEST ERROR:", error.message);
  }
};

testStripe();
