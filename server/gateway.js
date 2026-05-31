const dotenv = require('dotenv');

dotenv.config();

const isMock = !process.env.STRIPE_SECRET_KEY || 
               process.env.STRIPE_SECRET_KEY === 'mock' || 
               process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock');

let stripe = null;
if (!isMock) {
  console.log('Gateway Service: Initializing Stripe integration with secret key...');
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.log('Gateway Service: Initializing Mock Payment Gateway Simulator...');
}


async function processCardPayment(paymentData) {
  if (isMock) {
    return simulateMockCardPayment(paymentData);
  } else {
    return processStripePayment(paymentData);
  }
}


async function processStripePayment(paymentData) {
  try {
    const returnUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/checkout/payment/card/complete-3ds`;
    
    
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100), 
      currency: paymentData.currency.toLowerCase(),
      payment_method_data: {
        type: 'card',
        card: {
          token: paymentData.cardToken,
        }
      },
      confirm: true,
      description: `Payment for ${paymentData.productName || 'Celestial Membership'}`,
      metadata: {
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        checkoutSessionId: paymentData.checkoutSessionId,
        productId: paymentData.productId
      },
      receipt_email: paymentData.customerEmail,
      return_url: returnUrl,
    });
    
    
    if (paymentIntent.status === 'requires_action' && 
        paymentIntent.next_action?.type === 'redirect_to_url') {
      return {
        status: 'requires_authentication',
        authenticationUrl: paymentIntent.next_action.redirect_to_url.url,
        challengeToken: paymentIntent.client_secret,
        gatewayPaymentIntentId: paymentIntent.id
      };
    }
    
    
    if (paymentIntent.status === 'succeeded') {
      const charge = paymentIntent.charges?.data[0] || {};
      const cardDetails = charge.payment_method_details?.card || {};
      return {
        status: 'succeeded',
        transactionId: charge.id || `txn_${paymentIntent.id}`,
        gatewayTransactionId: paymentIntent.id,
        authorizationCode: cardDetails.authorization_code || 'AUTH_STRIPE',
        cardLast4: cardDetails.last4 || '4242',
        cardBrand: cardDetails.brand || 'visa',
        cardExpiry: `${cardDetails.exp_month}/${cardDetails.exp_year}`
      };
    }
    
    
    return {
      status: 'failed',
      failureCode: paymentIntent.last_payment_error?.code || 'payment_failed',
      failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
    };
    
  } catch (error) {
    console.error('Gateway Service (Stripe Error):', error);
    return {
      status: 'failed',
      failureCode: error.code || 'gateway_error',
      failureMessage: error.message || 'Error processing card payment via Stripe'
    };
  }
}


async function simulateMockCardPayment(paymentData) {
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { cardToken, paymentId, orderId, checkoutSessionId } = paymentData;

  
  if (cardToken === 'tok_chargeDeclined' || 
      cardToken.includes('decline') || 
      cardToken.includes('fail')) {
    return {
      status: 'failed',
      failureCode: 'card_declined',
      declineCode: 'insufficient_funds',
      failureMessage: 'Your card was declined. Please try a different payment method.',
      details: 'The card has insufficient funds to complete this purchase.'
    };
  }

  
  if (cardToken === 'tok_3ds' || 
      cardToken.includes('3ds') || 
      cardToken.includes('challenge')) {
    
    
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const challengeToken = `3ds_mock_${Math.random().toString(36).substring(2, 10)}`;
    const authenticationUrl = `${appUrl}/3ds-challenge.html?paymentId=${paymentId}&token=${challengeToken}`;
    
    return {
      status: 'requires_authentication',
      authenticationUrl: authenticationUrl,
      challengeToken: challengeToken,
      gatewayPaymentIntentId: `pi_mock_${Math.random().toString(36).substring(2, 10)}`
    };
  }

  
  const randomTxn = Math.random().toString(36).substring(2, 10).toUpperCase();
  const brand = cardToken.includes('mastercard') ? 'mastercard' : 
                cardToken.includes('amex') ? 'amex' : 
                cardToken.includes('discover') ? 'discover' : 'visa';

  return {
    status: 'succeeded',
    transactionId: `txn_mock_${randomTxn}`,
    gatewayTransactionId: `pi_mock_${randomTxn}`,
    authorizationCode: `AUTH${Math.floor(100000 + Math.random() * 900000)}`,
    retrievalReferenceNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
    cardLast4: '4242',
    cardBrand: brand,
    cardExpiry: '12/2028'
  };
}

module.exports = {
  processCardPayment,
  isMock
};
