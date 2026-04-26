const fs = require('fs');
const http = require('http');

const PORT = Number(process.env.PORT || 3001);
const env = loadEnv();
const pendingPayments = new Map();

const fallbackCards = [
  { id: '1', card_name: 'Chase Sapphire Reserve', network: 'visa', last_four: '4242', benefits: { food: 3, travel: 3, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: '2', card_name: 'Amex Gold Card', network: 'amex', last_four: '1005', benefits: { food: 4, groceries: 4, travel: 3, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: '3', card_name: 'Capital One Venture', network: 'visa', last_four: '3391', benefits: { travel: 2, food: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { id: '4', card_name: 'Amex Platinum Card', network: 'amex', last_four: '0052', benefits: { travel: 5, food: 1, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: '5', card_name: 'Citi Double Cash', network: 'mastercard', last_four: '5555', benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
];

const merchants = [
  { merchantName: 'Chipotle', merchantCategory: 'food', amount: 18.5, mcc: 5814 },
  { merchantName: 'Delta', merchantCategory: 'travel', amount: 246.2, mcc: 4511 },
  { merchantName: 'Target', merchantCategory: 'shopping', amount: 64.79, mcc: 5310 },
  { merchantName: 'Whole Foods', merchantCategory: 'groceries', amount: 52.34, mcc: 5411 },
  { merchantName: 'Shell', merchantCategory: 'gas', amount: 41.08, mcc: 5541 },
];

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true, service: 'SmartWallet backend', port: PORT });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/recommend') {
      const category = categoryFromMcc(Number(url.searchParams.get('mcc') || 0));
      const allCards = fallbackCards;
      sendJson(res, 200, { category, recommendedCard: pickBestCard(allCards, category), allCards });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/simulate-payment') {
      const body = await readJson(req);
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const result = buildPayment({ ...merchant, userId: body.userId, cards: body.cards });
      pendingPayments.set(result.paymentIntentId, result);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/payment-intent') {
      const body = await readJson(req);
      const merchantCategory = categoryFromMcc(Number(body.merchantMcc || body.mcc || 0));
      const result = buildPayment({
        userId: body.userId,
        merchantName: body.merchantName || 'Demo Merchant',
        merchantCategory,
        amount: Number(body.amount || 0),
        cards: body.cards,
      });
      pendingPayments.set(result.paymentIntentId, result);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/confirm-payment') {
      const body = await readJson(req);
      sendJson(res, 200, { ok: true, status: 'succeeded', paymentIntentId: body.paymentIntentId, cardId: body.cardId });
      return;
    }

    sendJson(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartWallet backend listening on http://0.0.0.0:${PORT}`);
});

function buildPayment({ userId, merchantName, merchantCategory, amount, cards }) {
  const allCards = normalizeCards(cards);
  const recommendedCard = pickBestCard(allCards, merchantCategory);
  return {
    clientSecret: 'demo_client_secret',
    paymentIntentId: `demo_pi_${Date.now()}`,
    userId,
    merchantName,
    merchantCategory,
    amount,
    recommendedCard,
    allCards,
    savings: calculateSavings(amount, recommendedCard, merchantCategory),
  };
}

function normalizeCards(cards) {
  const source = Array.isArray(cards) && cards.length > 0 ? cards : fallbackCards;
  return source.map((card) => ({
    id: String(card.id),
    card_name: card.card_name || card.cardName || 'Unnamed Card',
    network: card.network || 'visa',
    last_four: card.last_four || card.last4 || '0000',
    benefits: card.benefits || { other: 1 },
  }));
}

function pickBestCard(cards, category) {
  return [...cards].sort((a, b) => getRate(b, category) - getRate(a, category))[0] || null;
}

function getRate(card, category) {
  return Number(card.benefits?.[category] ?? card.benefits?.other ?? 1);
}

function calculateSavings(amount, card, category) {
  if (!card) return '$0.00';
  const savings = (Number(amount) * (getRate(card, category) - 1)) / 100;
  return savings > 0 ? `$${savings.toFixed(2)}` : '$0.00';
}

function categoryFromMcc(mcc) {
  if ([5812, 5813, 5814].includes(mcc)) return 'food';
  if ([3000, 3351, 4411, 4511, 4722, 7011].includes(mcc)) return 'travel';
  if ([5411, 5422, 5451, 5462, 5499].includes(mcc)) return 'groceries';
  if ([5541, 5542].includes(mcc)) return 'gas';
  if ([7832, 7922, 7991, 7996, 7999].includes(mcc)) return 'entertainment';
  if ([5310, 5311, 5331, 5651, 5661, 5732, 5942, 5999].includes(mcc)) return 'shopping';
  return 'other';
}

async function logTransaction(userId, cardId, payment) {
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const card = payment.allCards.find((item) => item.id === cardId) || payment.recommendedCard;
  await fetch(`${supabaseUrl}/rest/v1/transactions`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: userId || payment.userId,
      amount: payment.amount,
      currency: 'usd',
      merchant_name: payment.merchantName,
      merchant_category: payment.merchantCategory,
      card_name: card?.card_name || null,
      status: 'completed',
      stripe_payment_intent_id: payment.paymentIntentId,
      used_recommended: card?.id === payment.recommendedCard?.id,
    }),
  }).catch(() => undefined);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

function setCors(res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type, authorization, apikey, prefer');
}

function loadEnv() {
  const result = { ...process.env };
  if (!fs.existsSync('.env')) return result;
  const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    result[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return result;
}


