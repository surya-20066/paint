const Queue = require('bull');
const dotenv = require('dotenv');
const db = require('./db');
const gateway = require('./gateway');

dotenv.config();

const isRedisConfigured = !!process.env.REDIS_HOST;

// Mock Queue Implementation for local zero-config development
class MockQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.processor = null;
    this.isProcessing = false;
  }
  
  async add(jobName, data, options = {}) {
    const jobId = `job_${Math.random().toString(36).substring(2, 10)}`;
    const job = { 
      id: jobId, 
      name: jobName, 
      data, 
      attempts: 0, 
      maxAttempts: options.attempts || 3 
    };
    this.jobs.push(job);
    console.log(`[Queue: Mock] Added job ${jobId} to queue: ${jobName}`);
    
    // Start processing async in the next event loop tick
    process.nextTick(() => this.processNextJob());
    
    return { id: jobId };
  }
  
  process(jobName, concurrency, processorFn) {
    this.processor = processorFn;
  }
  
  async processNextJob() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;
    
    const job = this.jobs.shift();
    console.log(`[Queue: Mock] Processing job ${job.id} (${job.name})...`);
    
    try {
      if (this.processor) {
        await this.processor(job);
      }
      console.log(`[Queue: Mock] Job ${job.id} completed successfully.`);
    } catch (error) {
      console.error(`[Queue: Mock] Job ${job.id} failed:`, error);
      job.attempts++;
      if (job.attempts < job.maxAttempts) {
        console.log(`[Queue: Mock] Retrying job ${job.id} in 2000ms (Attempt ${job.attempts + 1}/${job.maxAttempts})...`);
        setTimeout(() => {
          this.jobs.push(job);
          this.processNextJob();
        }, 2000);
      } else {
        console.error(`[Queue: Mock] Job ${job.id} permanently failed after max attempts.`);
      }
    } finally {
      this.isProcessing = false;
      if (this.jobs.length > 0) {
        setTimeout(() => this.processNextJob(), 100);
      }
    }
  }
}

// Instantiate either Bull queue or Local Mock Queue
let paymentQueue;

if (isRedisConfigured) {
  console.log(`Queue Service: Using Bull Queue connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`);
  paymentQueue = new Queue('payment-processing', {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined
    }
  });
} else {
  console.log('Queue Service: Redis not configured. Falling back to Local Async In-Memory queue.');
  paymentQueue = new MockQueue('payment-processing');
}

/**
 * Queue Payment processing
 */
async function queuePaymentProcessing(paymentData) {
  console.log(`Queue Service: Queueing payment processing for payment ID ${paymentData.paymentId}`);
  const jobId = await paymentQueue.add('process-card-payment', paymentData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
  return jobId.id;
}

/**
 * Helper Actions
 */
async function updatePaymentStatus(paymentId, status, errorMessage = null) {
  console.log(`[Queue Worker] Updating payment status to: ${status}`);
  const timestampField = status === 'processing' ? 'processing_at' : 
                         status === 'succeeded' ? 'succeeded_at' : 
                         status === 'failed' ? 'failed_at' : null;
                         
  let queryText = '';
  let params = [];
  
  if (timestampField) {
    queryText = `
      UPDATE payments 
      SET status = $1, ${timestampField} = CURRENT_TIMESTAMP, failure_message = $2, updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $3
    `;
    params = [status, errorMessage, paymentId];
  } else {
    queryText = `
      UPDATE payments 
      SET status = $1, failure_message = $2, updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $3
    `;
    params = [status, errorMessage, paymentId];
  }
  
  await db.query(queryText, params);
  
  // Log event
  await db.query(`
    INSERT INTO payment_events (payment_id, event_type, status, message, timestamp)
    VALUES ($1, 'status_update', $2, $3, CURRENT_TIMESTAMP)
  `, [paymentId, status, `Payment status transitioned to ${status}${errorMessage ? ': ' + errorMessage : ''}`]);
}

async function updatePaymentWithResult(paymentId, result) {
  console.log(`[Queue Worker] Writing gateway result to database: ${result.status}`);
  
  let queryText = '';
  let params = [];
  
  if (result.status === 'succeeded') {
    queryText = `
      UPDATE payments 
      SET status = 'succeeded',
          gateway_transaction_id = $1,
          authorization_code = $2,
          retrieval_reference_number = $3,
          card_last4 = $4,
          card_brand = $5,
          card_expiry = $6,
          succeeded_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $7
    `;
    params = [
      result.gatewayTransactionId || result.transactionId,
      result.authorizationCode,
      result.retrievalReferenceNumber || null,
      result.cardLast4,
      result.cardBrand,
      result.cardExpiry,
      paymentId
    ];
  } else if (result.status === 'requires_authentication') {
    queryText = `
      UPDATE payments 
      SET status = 'requires_authentication',
          requires_3ds = 1,
          three_ds_challenge_url = $1,
          three_ds_token = $2,
          gateway_payment_intent_id = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $4
    `;
    params = [
      result.authenticationUrl,
      result.challengeToken,
      result.gatewayPaymentIntentId,
      paymentId
    ];
  } else {
    queryText = `
      UPDATE payments 
      SET status = 'failed',
          failure_code = $1,
          failure_message = $2,
          failed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $3
    `;
    params = [
      result.failureCode || 'payment_failed',
      result.failureMessage || 'Payment was declined by the gateway',
      paymentId
    ];
  }
  
  await db.query(queryText, params);
  
  // Update associated checkout session as completed if payment succeeded
  if (result.status === 'succeeded') {
    // Find checkout session associated with this payment to set completed
    const paymentInfo = await db.query('SELECT checkout_session_id FROM payments WHERE payment_id = $1', [paymentId]);
    if (paymentInfo.rows.length > 0) {
      const sessionId = paymentInfo.rows[0].checkout_session_id;
      await db.query(`
        UPDATE checkout_sessions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $1
      `, [sessionId]);
    }
  }
  
  // Log event
  await db.query(`
    INSERT INTO payment_events (payment_id, event_type, status, message, gateway_response, timestamp)
    VALUES ($1, 'gateway_response', $2, $3, $4, CURRENT_TIMESTAMP)
  `, [
    paymentId, 
    result.status, 
    `Gateway returned status: ${result.status}`,
    JSON.stringify(result)
  ]);
}

// Business actions triggered upon successful payment
async function activateMembership(customerId, productId) {
  console.log(`[Merchant Logic] Activating membership tier. Customer: ${customerId}, Product: ${productId}`);
}

async function sendConfirmationEmail(email, orderId) {
  console.log(`[Merchant Logic] Confirmation email sent successfully to ${email} for Order ID ${orderId}`);
}

async function notifyMerchantWebhook(paymentData) {
  console.log(`[Merchant Logic] Dispatched webhook event for Payment ID ${paymentData.paymentId}`);
}

// Register the worker job processor
paymentQueue.process('process-card-payment', 5, async (job) => {
  const paymentData = job.data;
  
  try {
    // 1. Update status in database to processing
    await updatePaymentStatus(paymentData.paymentId, 'processing');
    
    // 2. Process payment with Stripe / Simulator gateway
    const result = await gateway.processCardPayment(paymentData);
    
    // 3. Update payment status in DB based on gateway result
    await updatePaymentWithResult(paymentData.paymentId, result);
    
    // 4. Trigger post-payment processes if succeeded
    if (result.status === 'succeeded') {
      const customerId = paymentData.customerId || 'CUST_UNKNOWN';
      const productId = paymentData.productId || 'membership_celestial_annual';
      const email = paymentData.customerEmail || 'customer@example.com';
      
      await activateMembership(customerId, productId);
      await sendConfirmationEmail(email, paymentData.orderId);
      await notifyMerchantWebhook(paymentData);
    }
    
    return result;
  } catch (error) {
    console.error(`[Queue Worker Exception] Payment ID ${paymentData.paymentId} error:`, error);
    await updatePaymentStatus(paymentData.paymentId, 'failed', error.message);
    throw error;
  }
});

module.exports = {
  queuePaymentProcessing
};
