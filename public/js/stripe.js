import axios from 'axios';
import { showAlert } from './alerts';
//PROBLEM!
const stripe = Stripe(
  'pk_test_51KTUspIox1Oc32Z3UzVqz8KlSP7n82BkWPFArry97psdsB1LkZad3Z6wiRIrgh79aqPyyQi1WYg35J6RlrJWz4P400DN58RGY5'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
