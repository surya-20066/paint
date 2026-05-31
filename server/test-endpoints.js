const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;


function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(responseBody)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}


function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(responseBody)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('===========================================================');
  console.log('🧪 Starting PaymentGate End-to-End API Integration Tests');
  console.log('===========================================================\n');

  try {
    
    console.log('Step 1: Initializing Checkout Session...');
    const initData = {
      productId: 'membership_celestial_annual',
      productName: 'Celestial Membership',
      productTier: 'Annual Premium Tier',
      pricing: {
        subtotal: 1200.00,
        platformFee: 12.50,
        tax: 96.00,
        total: 1308.50,
        currency: 'USD'
      }
    };
    
    const initRes = await post('/api/v1/checkout/initialize', initData);
    if (initRes.statusCode !== 200 || !initRes.body.success) {
      throw new Error(`Failed to initialize session. Status: ${initRes.statusCode}, Body: ${JSON.stringify(initRes.body)}`);
    }

    const { checkoutSessionId, sessionToken } = initRes.body;
    console.log(`✅ Success! Session Created: ${checkoutSessionId}`);
    console.log(`🔑 JWT Token generated (truncated): ${sessionToken.substring(0, 30)}...\n`);

    
    console.log('Step 2: Testing Card Validation helper API...');
    const cardCheck = {
      cardNumber: '4242 4242 4242 4242',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123'
    };
    const valRes = await post('/api/v1/checkout/validate/card', cardCheck);
    if (valRes.statusCode !== 200 || !valRes.body.valid) {
      throw new Error(`Card validation failed. Body: ${JSON.stringify(valRes.body)}`);
    }
    console.log(`✅ Success! Detected Card Brand: ${valRes.body.cardBrand.toUpperCase()}\n`);

    
    console.log('Step 3: Processing Card Payment...');
    const paymentData = {
      checkoutSessionId,
      paymentMethod: 'credit_card',
      cardToken: 'tok_visa',
      cardholderName: 'ALEXANDRA VANCE',
    };
    const paymentHeaders = {
      'Authorization': `Bearer ${sessionToken}`,
      'X-Session-Id': checkoutSessionId,
      'X-Idempotency-Key': `idem_test_${Math.random().toString(36).substring(2,10)}`
    };

    const payRes = await post('/api/v1/checkout/payment/card', paymentData, paymentHeaders);
    if (payRes.statusCode !== 200) {
      throw new Error(`Payment processing request failed. Status: ${payRes.statusCode}`);
    }

    const payBody = payRes.body;
    console.log(`✅ Payment Request Dispatched. Current Status: ${payBody.status}`);
    const paymentId = payBody.paymentId;
    console.log(`💳 Payment Reference ID: ${paymentId}`);

    
    console.log('\nStep 4: Polling Payment Status for final resolution...');
    let finalStatus = payBody.status;
    let attempts = 0;
    
    while ((finalStatus === 'initiated' || finalStatus === 'processing') && attempts < 10) {
      attempts++;
      console.log(`Polling status (Attempt ${attempts})...`);
      await sleep(1000);
      const statusRes = await get(`/api/v1/checkout/payment/status/${paymentId}`);
      if (statusRes.statusCode === 200) {
        finalStatus = statusRes.body.status;
      }
    }

    if (finalStatus === 'succeeded') {
      console.log('🎉 SUCCESS! Payment fully processed and captured.');
      console.log('Timeline History:');
      const statusRes = await get(`/api/v1/checkout/payment/status/${paymentId}`);
      statusRes.body.timeline.forEach(t => {
        console.log(`  - [${t.status.toUpperCase()}] ${t.message}`);
      });
    } else {
      throw new Error(`Payment processing resolved to unexpected state: ${finalStatus}`);
    }

    console.log('\n===========================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('===========================================================');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ INTEGRATION TESTS FAILED:');
    console.error(err.message || err);
    console.error('===========================================================');
    process.exit(1);
  }
}

runTests();
