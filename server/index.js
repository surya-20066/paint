const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

const db = require('./db');
const queue = require('./queue');
const gateway = require('./gateway');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_paymentgate_32_chars_long';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'super_secret_webhook_signature_key';


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Idempotency-Key']
}));


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://*", "http://*"],
      connectSrc: ["'self'", "*"]
    }
  }
}));

app.use(morgan('dev'));


app.post('/api/v1/webhooks/payment-gateway', express.raw({ type: 'application/json' }), handleWebhook);


app.use(express.json());


app.use(express.static(path.resolve(__dirname, '../')));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    error: {
      code: 'rate_limit_exceeded',
      type: 'system_error',
      message: 'Too many requests. Please try again later.'
    }
  }
});
app.use('/api/', globalLimiter);


const paymentLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10), 
  message: {
    success: false,
    error: {
      code: 'rate_limit_exceeded',
      type: 'security_error',
      message: 'Too many payment attempts. Please try again later.',
      declineCode: 'rate_limit_exceeded'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});


function verifySessionToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'invalid_token',
        type: 'authentication_error',
        message: 'Access Denied: No token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.session = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'invalid_token',
        type: 'authentication_error',
        message: 'Invalid or expired checkout session token'
      }
    });
  }
}


app.post('/api/v1/checkout/initialize', async (req, res) => {
  try {
    const {
      productId,
      productName,
      productTier,
      customerId,
      customerEmail,
      customerPhone,
      pricing,
      metadata = {},
      redirectUrls = {}
    } = req.body;

    
    if (!productId || !pricing || !pricing.total) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_amount',
          type: 'validation_error',
          message: 'Product ID and pricing total are required fields.'
        }
      });
    }

    const sessionId = `cs_${crypto.randomBytes(8).toString('hex')}`;
    const token = jwt.sign(
      {
        sessionId: sessionId,
        customerId: customerId || 'CUST_12345',
        type: 'checkout_session'
      },
      JWT_SECRET,
      { expiresIn: '30m', algorithm: 'HS256' }
    );

    const subtotal = pricing.subtotal || pricing.total;
    const platformFee = pricing.platformFee || 0;
    const tax = pricing.tax || 0;
    const totalAmount = pricing.total;
    const currency = pricing.currency || 'USD';
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const insertQuery = `
      INSERT INTO checkout_sessions (
        session_id, session_token, customer_id, customer_email, customer_phone,
        product_id, product_name, product_tier, subtotal, platform_fee, tax,
        total_amount, currency, status, success_url, failure_url, cancel_url,
        ip_address, user_agent, metadata, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const params = [
      sessionId, token, customerId || 'CUST_12345', customerEmail || 'customer@example.com', customerPhone || null,
      productId, productName || 'Celestial Membership', productTier || 'Annual Premium Tier',
      subtotal, platformFee, tax, totalAmount, currency, 'active',
      redirectUrls.success || '/checkout-success.html',
      redirectUrls.failure || '/checkout-failure.html',
      redirectUrls.cancel || '/checkout-cancel.html',
      req.ip, req.headers['user-agent'], JSON.stringify(metadata), expiresAt
    ];

    await db.query(insertQuery, params);

    res.status(200).json({
      success: true,
      checkoutSessionId: sessionId,
      sessionToken: token,
      order: {
        orderId: `ORD_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        productId,
        productName: productName || 'Celestial Membership',
        productTier: productTier || 'Annual Premium Tier',
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3oaAqkpu5b2M5gbl2pE3-ZdPsUWXBTNMuAuxKG5a2ezhf8NcaIY_7cDTj0zWr_X0TKjTY1SDjCRMQvlItnyDyfbpeYAS5SxU-JKHftC2DW69Yd_lnHrotqF0hsXIisEdbptP0kAnihy30vDKNFKZHqttn7wGN0oQNIyu9V1NEN7aMzCxY2WbPlNxWB91YmLISBU-LY3YZyFeq8VGjYznykqvBQm3ry4JEipsKlaTQqvPKkvXPA0TzBhYmigVtnxLJscyEb1xtjX8h",
        total: parseFloat(totalAmount),
        currency
      },
      paymentMethods: {
        creditCard: {
          enabled: true,
          supportedNetworks: ["visa", "mastercard", "amex", "discover"],
          requires3DS: true
        },
        digitalWallet: {
          enabled: true,
          providers: ["apple_pay", "google_pay", "paypal"]
        },
        netBanking: {
          enabled: true,
          supportedBanks: ["hdfc", "icici", "sbi", "axis"]
        }
      },
      securityContext: {
        tokenizationKey: "pk_test_51A2B3C4D5E6F7G8H",
        merchantId: "merchant_paymentgate",
        environment: process.env.NODE_ENV || "development"
      },
      expiresAt,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error (Initialize Checkout):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not initialize checkout session.'
      }
    });
  }
});


app.post('/api/v1/checkout/payment/card', verifySessionToken, paymentLimiter, async (req, res) => {
  try {
    const {
      checkoutSessionId,
      paymentMethod,
      cardToken,
      cardholderName,
      billingAddress = {},
      saveCard = false,
      deviceFingerprint,
      browserInfo = {}
    } = req.body;

    const idempotencyKey = req.headers['x-idempotency-key'];
    const headerSessionId = req.headers['x-session-id'] || checkoutSessionId;

    if (!headerSessionId || !cardToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_card_number',
          type: 'validation_error',
          message: 'Session ID and Card Token are required.'
        }
      });
    }

    
    if (idempotencyKey) {
      const existingPayment = await db.query('SELECT * FROM payments WHERE idempotency_key = $1', [idempotencyKey]);
      if (existingPayment.rows.length > 0) {
        console.log(`API Log: Idempotency hit! Returning cached payment response for key: ${idempotencyKey}`);
        const p = existingPayment.rows[0];
        return returnPaymentResponse(p, res);
      }
    }

    
    const sessionRes = await db.query('SELECT * FROM checkout_sessions WHERE session_id = $1', [headerSessionId]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Checkout session not found.'
        }
      });
    }

    const session = sessionRes.rows[0];

    
    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'duplicate_transaction',
          type: 'validation_error',
          message: 'This checkout session has already been completed.'
        }
      });
    }

    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Checkout session expired.'
        }
      });
    }

    
    const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
    const orderId = `ORD_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const insertPaymentQuery = `
      INSERT INTO payments (
        payment_id, checkout_session_id, order_id, amount, currency,
        payment_method, card_token, payment_method_details, billing_address,
        status, customer_email, customer_phone, idempotency_key, metadata, initiated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
    `;

    const paymentParams = [
      paymentId, session.session_id, orderId, session.total_amount, session.currency,
      'credit_card', cardToken, JSON.stringify({ cardholderName: cardholderName || 'ALEXANDRA VANCE' }), JSON.stringify(billingAddress),
      'initiated', session.customer_email, session.customer_phone, idempotencyKey || null, JSON.stringify({ deviceFingerprint: deviceFingerprint || 'fp_default' })
    ];

    await db.query(insertPaymentQuery, paymentParams);

    
    await db.query(`
      INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
      VALUES ($1, 'payment_initiated', 'initiated', 'Payment request received from client', CURRENT_TIMESTAMP)
    `, [paymentId]);

    
    const queuePayload = {
      paymentId,
      checkoutSessionId: session.session_id,
      orderId,
      amount: session.total_amount,
      currency: session.currency,
      cardToken,
      customerId: session.customer_id,
      customerEmail: session.customer_email,
      productId: session.product_id,
      productName: session.product_name
    };

    await queue.queuePaymentProcessing(queuePayload);

    
    let processedPayment = null;
    const pollInterval = 200; 
    const maxAttempts = 15;    

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      const currentRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
      if (currentRes.rows.length > 0) {
        processedPayment = currentRes.rows[0];
        if (processedPayment.status !== 'initiated' && processedPayment.status !== 'processing') {
          break;
        }
      }
    }

    
    return returnPaymentResponse(processedPayment, res);

  } catch (error) {
    console.error('API Error (Process Credit Card):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'processing_error',
        type: 'system_error',
        message: 'An error occurred during payment processing.'
      }
    });
  }
});


app.post('/api/v1/checkout/payment/card/complete-3ds', async (req, res) => {
  try {
    const { paymentId, challengeToken, authenticationResult } = req.body;

    if (!paymentId || !authenticationResult) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'authentication_failed',
          type: 'validation_error',
          message: 'Payment ID and authentication result are required.'
        }
      });
    }

    
    const paymentRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
    if (paymentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'invalid_token',
          type: 'validation_error',
          message: 'Payment record not found.'
        }
      });
    }

    const payment = paymentRes.rows[0];

    if (payment.status === 'succeeded') {
      return returnPaymentResponse(payment, res);
    }

    if (authenticationResult === 'authenticated') {
      
      await db.query(`
        UPDATE payments 
        SET status = 'succeeded', three_ds_authenticated = 1, authenticated_at = CURRENT_TIMESTAMP, succeeded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = $1
      `, [paymentId]);

      await db.query(`
        UPDATE checkout_sessions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $1
      `, [payment.checkout_session_id]);

      await db.query(`
        INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
        VALUES ($1, '3ds_authentication_success', 'succeeded', '3D Secure authentication successful. Payment captured.', CURRENT_TIMESTAMP)
      `, [paymentId]);

      
      const updatedRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
      return returnPaymentResponse(updatedRes.rows[0], res);

    } else {
      
      await db.query(`
        UPDATE payments 
        SET status = 'failed', failure_code = 'authentication_failed', failure_message = '3D Secure authentication failed.', failed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = $1
      `, [paymentId]);

      await db.query(`
        INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
        VALUES ($1, '3ds_authentication_failed', 'failed', '3D Secure authentication failed by the customer.', CURRENT_TIMESTAMP)
      `, [paymentId]);

      const updatedRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
      return returnPaymentResponse(updatedRes.rows[0], res);
    }

  } catch (error) {
    console.error('API Error (Complete 3DS):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not complete 3D Secure verification.'
      }
    });
  }
});


app.post('/api/v1/checkout/payment/wallet', async (req, res) => {
  try {
    const { checkoutSessionId, paymentMethod, walletType, walletToken, billingContact = {}, shippingContact = {} } = req.body;

    if (!checkoutSessionId || !walletToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_amount',
          type: 'validation_error',
          message: 'Checkout Session ID and Wallet Token are required.'
        }
      });
    }

    const sessionRes = await db.query('SELECT * FROM checkout_sessions WHERE session_id = $1', [checkoutSessionId]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Session not found.'
        }
      });
    }

    const session = sessionRes.rows[0];

    const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
    const orderId = `ORD_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const walletDetails = { walletType, walletToken, billingContact, shippingContact };

    
    const insertQuery = `
      INSERT INTO payments (
        payment_id, checkout_session_id, order_id, amount, currency,
        payment_method, wallet_type, wallet_token, payment_method_details,
        status, customer_email, customer_phone, succeeded_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    await db.query(insertQuery, [
      paymentId, session.session_id, orderId, session.total_amount, session.currency,
      'digital_wallet', walletType, walletToken, JSON.stringify(walletDetails),
      'succeeded', billingContact.email || session.customer_email, billingContact.phone || session.customer_phone
    ]);

    await db.query(`
      UPDATE checkout_sessions 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
    `, [session.session_id]);

    await db.query(`
      INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
      VALUES ($1, 'digital_wallet_payment_success', 'succeeded', 'Digital wallet transaction captured successfully.', CURRENT_TIMESTAMP)
    `, [paymentId]);

    const finalRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
    return returnPaymentResponse(finalRes.rows[0], res);

  } catch (error) {
    console.error('API Error (Process Wallet):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not process digital wallet transaction.'
      }
    });
  }
});


app.post('/api/v1/checkout/payment/netbanking', async (req, res) => {
  try {
    const { checkoutSessionId, paymentMethod, bankCode, accountHolderName } = req.body;

    if (!checkoutSessionId || !bankCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_amount',
          type: 'validation_error',
          message: 'Checkout Session ID and Bank Code are required.'
        }
      });
    }

    const sessionRes = await db.query('SELECT * FROM checkout_sessions WHERE session_id = $1', [checkoutSessionId]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Checkout Session not found.'
        }
      });
    }

    const session = sessionRes.rows[0];
    const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
    const orderId = `ORD_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const bankDetails = { bankCode, accountHolderName };

    
    const insertQuery = `
      INSERT INTO payments (
        payment_id, checkout_session_id, order_id, amount, currency,
        payment_method, bank_code, status, customer_email, customer_phone, payment_method_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await db.query(insertQuery, [
      paymentId, session.session_id, orderId, session.total_amount, session.currency,
      'net_banking', bankCode, 'initiated', session.customer_email, session.customer_phone, JSON.stringify(bankDetails)
    ]);

    await db.query(`
      INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
      VALUES ($1, 'net_banking_initiated', 'initiated', 'Net banking flow initiated, waiting redirect callback.', CURRENT_TIMESTAMP)
    `, [paymentId]);

    const bankRedirect = `${process.env.APP_URL || 'http://localhost:3000'}/netbanking-mock.html?paymentId=${paymentId}&bank=${bankCode}`;

    res.status(200).json({
      success: true,
      paymentId,
      orderId,
      status: 'pending',
      redirectUrl: bankRedirect,
      callbackUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/checkout/payment/netbanking/callback`,
      expiresIn: 900,
      message: `Redirecting to ${bankCode} Net Banking. Complete payment within 15 minutes.`
    });

  } catch (error) {
    console.error('API Error (Process Net Banking):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not initiate net banking transaction.'
      }
    });
  }
});


app.get('/api/v1/checkout/payment/netbanking/callback', async (req, res) => {
  try {
    const { paymentId, status } = req.query;

    if (!paymentId) {
      return res.status(400).send('Missing paymentId parameter.');
    }

    const paymentRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
    if (paymentRes.rows.length === 0) {
      return res.status(404).send('Payment record not found.');
    }

    const payment = paymentRes.rows[0];

    if (status === 'success') {
      await db.query(`
        UPDATE payments 
        SET status = 'succeeded', succeeded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = $1
      `, [paymentId]);

      await db.query(`
        UPDATE checkout_sessions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $1
      `, [payment.checkout_session_id]);

      await db.query(`
        INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
        VALUES ($1, 'net_banking_success', 'succeeded', 'Net banking callback processed successfully.', CURRENT_TIMESTAMP)
      `, [paymentId]);

      
      res.redirect(`/checkout-success.html?session=${payment.checkout_session_id}&payment=${paymentId}`);
    } else {
      await db.query(`
        UPDATE payments 
        SET status = 'failed', failure_code = 'netbanking_declined', failure_message = 'Net banking payment failed or cancelled.', failed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = $1
      `, [paymentId]);

      await db.query(`
        INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
        VALUES ($1, 'net_banking_failed', 'failed', 'Net banking callback reported payment failure.', CURRENT_TIMESTAMP)
      `, [paymentId]);

      res.redirect(`/checkout-failure.html?session=${payment.checkout_session_id}&payment=${paymentId}`);
    }

  } catch (error) {
    console.error('API Error (Netbanking Callback):', error);
    res.status(500).send('Error processing callback redirection.');
  }
});


app.get('/api/v1/checkout/payment/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentRes = await db.query('SELECT * FROM payments WHERE payment_id = $1', [paymentId]);
    if (paymentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'invalid_token',
          type: 'validation_error',
          message: 'Payment ID not found.'
        }
      });
    }

    const payment = paymentRes.rows[0];

    
    const eventsRes = await db.query(`
      SELECT status, event_type, message, timestamp 
      FROM payment_events 
      WHERE payment_id = $1 
      ORDER BY timestamp ASC
    `, [paymentId]);

    const timeline = eventsRes.rows.map(evt => ({
      status: evt.status,
      timestamp: evt.timestamp,
      message: evt.message
    }));

    
    let nextAction = null;
    if (payment.status === 'requires_authentication') {
      nextAction = {
        type: '3ds_challenge',
        authenticationUrl: payment.three_ds_challenge_url,
        challengeToken: payment.three_ds_token
      };
    }

    res.status(200).json({
      success: true,
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      status: payment.status,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      timeline: timeline.length > 0 ? timeline : [
        {
          status: 'initiated',
          timestamp: payment.initiated_at,
          message: 'Payment initiated'
        }
      ],
      nextAction,
      createdAt: payment.created_at,
      completedAt: payment.succeeded_at || payment.failed_at || null
    });

  } catch (error) {
    console.error('API Error (Get Payment Status):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not fetch payment status.'
      }
    });
  }
});


async function handleWebhook(req, res) {
  try {
    const signature = req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
    const webhookId = `wh_${crypto.randomBytes(8).toString('hex')}`;

    
    let payloadString = '';
    if (Buffer.isBuffer(req.body)) {
      payloadString = req.body.toString('utf8');
    } else if (typeof req.body === 'string') {
      payloadString = req.body;
    } else {
      payloadString = JSON.stringify(req.body);
    }

    let payloadJson = {};
    try {
      payloadJson = JSON.parse(payloadString);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    
    const isMockWebhook = !signature || signature === 'mock' || process.env.STRIPE_SECRET_KEY === 'mock';
    let signatureValid = false;

    if (isMockWebhook) {
      signatureValid = true; 
    } else {
      
      try {
        const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);
        stripeInstance.webhooks.constructEvent(payloadString, signature, process.env.STRIPE_WEBHOOK_SECRET);
        signatureValid = true;
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        signatureValid = false;
      }
    }

    const eventType = payloadJson.type || 'payment_intent.succeeded';
    const source = isMockWebhook ? 'mock_gateway' : 'stripe';

    
    await db.query(`
      INSERT INTO webhook_logs (
        webhook_id, source, event_type, payload, signature, signature_valid, processed, received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 0, CURRENT_TIMESTAMP)
    `, [webhookId, source, eventType, payloadString, signature || null, signatureValid]);

    if (!signatureValid) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    
    process.nextTick(async () => {
      try {
        console.log(`Webhook: Processing event ${eventType} async...`);

        let paymentIntentId = '';
        let chargeDetails = {};
        let metadata = {};

        if (eventType === 'payment_intent.succeeded') {
          const pi = payloadJson.data?.object || payloadJson;
          paymentIntentId = pi.id;
          metadata = pi.metadata || {};

          
          const paymentId = metadata.paymentId;
          if (paymentId) {
            const paymentCheck = await db.query('SELECT status, checkout_session_id FROM payments WHERE payment_id = $1', [paymentId]);
            if (paymentCheck.rows.length > 0 && paymentCheck.rows[0].status !== 'succeeded') {
              await db.query(`
                UPDATE payments 
                SET status = 'succeeded', gateway_transaction_id = $1, succeeded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE payment_id = $2
              `, [paymentIntentId, paymentId]);

              await db.query(`
                UPDATE checkout_sessions 
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = $1
              `, [paymentCheck.rows[0].checkout_session_id]);

              await db.query(`
                INSERT INTO payment_events (payment_id, event_type, status, message, gateway_response, timestamp)
                VALUES ($1, 'webhook_captured', 'succeeded', 'Stripe webhook received, payment finalized.', $2, CURRENT_TIMESTAMP)
              `, [paymentId, payloadString]);
            }
          }
        }

        
        await db.query(`
          UPDATE webhook_logs 
          SET processed = 1, processing_status = 'success', processed_at = CURRENT_TIMESTAMP
          WHERE webhook_id = $1
        `, [webhookId]);

      } catch (processError) {
        console.error('Webhook processing execution error:', processError);
        await db.query(`
          UPDATE webhook_logs 
          SET processed = 0, processing_status = 'error', processing_error = $1, processed_at = CURRENT_TIMESTAMP
          WHERE webhook_id = $2
        `, [processError.message, webhookId]);
      }
    });

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook Receiver Endpoint Exception:', error);
    res.status(500).json({ error: 'Internal server webhook logger error' });
  }
}


app.post('/api/v1/checkout/validate/card', (req, res) => {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    if (!cardNumber) {
      return res.status(400).json({
        valid: false,
        error: 'Card number is required.'
      });
    }

    
    const cleanNum = cardNumber.replace(/\s+/g, '').trim();
    const cleanMonth = (expiryMonth || '').trim();
    const cleanYear = (expiryYear || '').trim();
    const cleanCvv = (cvv || '').trim();

    
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNum.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNum.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    const luhnCheck = sum % 10 === 0 && cleanNum.length >= 13 && cleanNum.length <= 19;

    
    let cardBrand = 'unknown';
    let cardType = 'credit';
    if (/^4/.test(cleanNum)) cardBrand = 'visa';
    else if (/^5[1-5]/.test(cleanNum) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleanNum)) cardBrand = 'mastercard';
    else if (/^3[47]/.test(cleanNum)) cardBrand = 'amex';
    else if (/^6(?:011|5[0-9]{2})/.test(cleanNum)) cardBrand = 'discover';

    
    let expiryValid = false;
    if (cleanMonth && cleanYear) {
      const month = parseInt(cleanMonth, 10);
      
      let year = parseInt(cleanYear, 10);
      if (year < 100) year += 2000;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (month >= 1 && month <= 12) {
        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
          expiryValid = true;
        }
      }
    }

    
    let cvvValid = false;
    if (cleanCvv) {
      const expectedLength = cardBrand === 'amex' ? 4 : 3;
      cvvValid = /^\d+$/.test(cleanCvv) && cleanCvv.length === expectedLength;
    }

    const numberValid = /^\d+$/.test(cleanNum) && luhnCheck;
    const valid = numberValid && expiryValid && cvvValid;

    res.status(200).json({
      valid,
      cardBrand,
      cardType,
      issuerCountry: 'US',
      issuerBank: 'Chase Bank',
      checks: {
        numberValid,
        expiryValid,
        cvvValid,
        luhnCheck
      }
    });

  } catch (error) {
    console.error('API Error (Validate Card):', error);
    res.status(500).json({
      valid: false,
      error: 'Card validation failed'
    });
  }
});


app.get('/api/v1/checkout/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionRes = await db.query('SELECT * FROM checkout_sessions WHERE session_id = $1', [sessionId]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Checkout Session ID not found.'
        }
      });
    }

    const session = sessionRes.rows[0];

    res.status(200).json({
      success: true,
      checkoutSessionId: session.session_id,
      sessionToken: session.session_token,
      order: {
        orderId: `ORD_${new Date(session.created_at).toISOString().slice(0, 10).replace(/-/g, '_')}_RECOVER`,
        productId: session.product_id,
        productName: session.product_name,
        productTier: session.product_tier,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3oaAqkpu5b2M5gbl2pE3-ZdPsUWXBTNMuAuxKG5a2ezhf8NcaIY_7cDTj0zWr_X0TKjTY1SDjCRMQvlItnyDyfbpeYAS5SxU-JKHftC2DW69Yd_lnHrotqF0hsXIisEdbptP0kAnihy30vDKNFKZHqttn7wGN0oQNIyu9V1NEN7aMzCxY2WbPlNxWB91YmLISBU-LY3YZyFeq8VGjYznykqvBQm3ry4JEipsKlaTQqvPKkvXPA0TzBhYmigVtnxLJscyEb1xtjX8h",
        total: parseFloat(session.total_amount),
        currency: session.currency
      },
      paymentMethods: {
        creditCard: {
          enabled: true,
          supportedNetworks: ["visa", "mastercard", "amex", "discover"],
          requires3DS: true
        },
        digitalWallet: {
          enabled: true,
          providers: ["apple_pay", "google_pay", "paypal"]
        },
        netBanking: {
          enabled: true,
          supportedBanks: ["hdfc", "icici", "sbi", "axis"]
        }
      },
      securityContext: {
        tokenizationKey: "pk_test_51A2B3C4D5E6F7G8H",
        merchantId: "merchant_paymentgate",
        environment: process.env.NODE_ENV || "development"
      },
      expiresAt: session.expires_at,
      createdAt: session.created_at
    });

  } catch (error) {
    console.error('API Error (Get Session):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not fetch session details.'
      }
    });
  }
});


app.post('/api/v1/checkout/cancel', async (req, res) => {
  try {
    const { checkoutSessionId, reason } = req.body;

    if (!checkoutSessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_amount',
          type: 'validation_error',
          message: 'Checkout Session ID is required.'
        }
      });
    }

    const updateRes = await db.query(`
      UPDATE checkout_sessions 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE session_id = $1
      RETURNING *
    `, [checkoutSessionId]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'session_expired',
          type: 'validation_error',
          message: 'Session not found or expired.'
        }
      });
    }

    res.status(200).json({
      success: true,
      checkoutSessionId,
      status: 'cancelled',
      message: 'Checkout session cancelled successfully'
    });

  } catch (error) {
    console.error('API Error (Cancel Session):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'gateway_error',
        type: 'system_error',
        message: 'Could not cancel checkout session.'
      }
    });
  }
});


function returnPaymentResponse(payment, res) {
  if (!payment) {
    return res.status(202).json({
      success: true,
      status: 'processing',
      message: 'Payment is being processed by the gateway.'
    });
  }

  
  if (payment.status === 'succeeded') {
    return res.status(200).json({
      success: true,
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      status: 'succeeded',
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      paymentMethod: {
        type: payment.payment_method,
        cardLast4: payment.card_last4 || '4242',
        cardBrand: payment.card_brand || 'visa',
        cardExpiry: payment.card_expiry || '12/2028'
      },
      transactionDetails: {
        transactionId: payment.gateway_transaction_id,
        gatewayTransactionId: payment.gateway_transaction_id,
        authorizationCode: payment.authorization_code,
        retrievalReferenceNumber: payment.retrieval_reference_number,
        timestamp: payment.succeeded_at
      },
      receiptUrl: `/receipt-${payment.payment_id}.html`,
      redirectUrl: `checkout-success.html?session=${payment.checkout_session_id}&payment=${payment.payment_id}`,
      message: "Payment successful! Your Celestial Membership is now active."
    });
  }

  
  if (payment.status === 'requires_authentication') {
    return res.status(200).json({
      success: true,
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      status: 'requires_authentication',
      authentication: {
        type: '3ds_challenge',
        authenticationUrl: payment.three_ds_challenge_url,
        challengeWindow: 'full_page',
        challengeToken: payment.three_ds_token,
        completeUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/checkout/payment/card/complete-3ds`
      },
      message: "Additional authentication required. Redirecting to 3D Secure verification."
    });
  }

  
  if (payment.status === 'failed') {
    return res.status(200).json({
      success: false,
      error: {
        code: payment.failure_code || 'card_declined',
        type: 'payment_error',
        message: payment.failure_message || 'Your card was declined. Please try a different payment method.',
        declineCode: payment.failure_code === 'authentication_failed' ? 'authentication_failed' : 'insufficient_funds',
        details: payment.failure_message || 'The card has insufficient funds to complete this purchase.'
      },
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      status: 'failed',
      retryable: true,
      suggestedActions: [
        "Try a different card",
        "Contact your bank",
        "Use an alternative payment method"
      ]
    });
  }

  
  if (payment.status === 'initiated' || payment.status === 'processing') {
    return res.status(202).json({
      success: true,
      paymentId: payment.payment_id,
      status: 'processing',
      message: 'Payment processing is ongoing.'
    });
  }

  return res.status(400).json({
    success: false,
    error: {
      code: 'processing_error',
      message: `Unknown payment status: ${payment.status}`
    }
  });
}


app.use((err, req, res, next) => {
  console.error('Unhandled System Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'system_error',
      type: 'internal_error',
      message: 'A critical unhandled exception occurred on the backend.'
    }
  });
});


db.initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`===========================================================`);
      console.log(`🚀 PaymentGate Backend is actively running on port ${PORT}`);
      console.log(`👉 Access secure frontend at http://localhost:${PORT}/payment.html`);
      console.log(`===========================================================`);
    });
  })
  .catch(err => {
    console.error('Fatal Database initialization failure:', err);
    process.exit(1);
  });
