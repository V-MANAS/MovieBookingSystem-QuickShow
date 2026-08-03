import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const testStripeSession = async () => {
  try {
    console.log("Testing Stripe Checkout with process.env.STRIPE_SECRET_KEY...");
    const session = await stripeInstance.checkout.sessions.create({
      success_url: 'http://localhost:5174/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}&bookingId=123',
      cancel_url: 'http://localhost:5174/my-bookings',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'QuickShow Movie Ticket',
              description: 'Avatar: Fire and Ash • 1 Ticket (Seats: A1)',
            },
            unit_amount: 10000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });
    console.log("INR Stripe Session created successfully:", session.url);
  } catch (error) {
    console.error("INR STRIPE ERROR CAUGHT:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Type:", error.type);
    console.error("Raw:", error.raw);
  }
};

testStripeSession();
