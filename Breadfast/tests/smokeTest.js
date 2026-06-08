const base = 'http://localhost:3000';
const fetch = global.fetch || require('node-fetch');

async function post(path, body, cookie) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, cookie ? { Cookie: cookie } : {}),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { res, body: json, raw: text, headers: res.headers };
}

async function get(path, cookie) {
  const res = await fetch(base + path, {
    method: 'GET',
    headers: cookie ? { Cookie: cookie } : {},
  });
  const body = await res.json().catch(() => null);
  return { res, body, headers: res.headers };
}

async function run() {
  try {
    const email = `smoke${Date.now()}@example.com`;
    const password = 'Pass1234';

    console.log('Creating user:', email);
    const create = await post('/users', {
      firstName: 'Smoke', lastName: 'Test', email, password, confirmPassword: password
    });
    console.log('Create user status', create.res.status);

    console.log('Signing in');
    const signinRes = await fetch(base + '/users/signin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const signinBody = await signinRes.json().catch(() => null);
    const setCookie = signinRes.headers.get('set-cookie') || signinRes.headers.get('Set-Cookie');
    console.log('Signin status', signinRes.status, signinBody);
    if (!setCookie) console.warn('No Set-Cookie received; subsequent requests may fail');

    const cookie = setCookie ? setCookie.split(';')[0] : null;
    const userId = signinBody && signinBody.user && (signinBody.user.id || signinBody.user._id);

    console.log('Fetching products');
    const products = await get('/products');
    if (!products.body || !products.body.length) {
      console.error('No products returned');
      return;
    }
    const product = products.body[0];
    console.log('Using product:', product._id || product.id, product.name || product.title);

    console.log('Adding to cart');
    const add = await post('/cart/add', { userId, productId: product._id || product.id, quantity: 1 }, cookie);
    console.log('Add to cart status', add.res.status, add.body);

    console.log('Creating order');
    const order = await post('/create-order', {
      userId,
      items: [{ product: product._id || product.id, quantity: 1 }],
      paymentMethod: 'credit',
      deliveryAddress: '123 Test St'
    }, cookie);
    console.log('Create order status', order.res.status, order.body);
  } catch (err) {
    console.error('Smoke test failed', err);
  }
}

run();
