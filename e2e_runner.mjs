import fs from 'fs';

const API_URL = 'http://localhost:3000/api/v1';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- KHỞI CHẠY BỘ TEST CÁC CHỨC NĂNG API ---');
  let token = '';
  // 1. Register & Login
  const randomEmail = `test${Date.now()}@gmail.com`;
  console.log(`[1] Đăng ký User: ${randomEmail}`);
  const regRes = await request('POST', '/auth/register', { 
    email: randomEmail, 
    password: 'password123', 
    fullName: 'Test User' 
  });
  console.log(`   -> Status: ${regRes.status}`, regRes.data);

  console.log(`[2] Đăng nhập`);
  const loginRes = await request('POST', '/auth/login', { 
    email: randomEmail, 
    password: 'password123' 
  });
  console.log(`   -> Status: ${loginRes.status}`, loginRes.data.access_token ? 'Có Token' : 'Không có Token');
  token = loginRes.data.access_token;

  // 2. Lấy Profile
  console.log(`[3] Lấy Profile (/users/me)`);
  const profileRes = await request('GET', '/users/me', null, token);
  console.log(`   -> Status: ${profileRes.status}`, profileRes.data.email);

  // 3. Xem danh mục
  console.log(`[4] Lấy Danh sách Category`);
  const catRes = await request('GET', '/categories');
  console.log(`   -> Status: ${catRes.status}`, `Tìm thấy ${catRes.data?.length || 0} danh mục`);
  const categories = catRes.data || [];

  // 4. Lấy Products
  console.log(`[5] Lấy Danh sách Product`);
  const prodRes = await request('GET', '/products');
  console.log(`   -> Status: ${prodRes.status}`, `Tìm thấy ${prodRes.data?.data?.length || 0} sản phẩm`);
  const products = prodRes.data?.data || [];

  // 5. Thử mua 1 sản phẩm (nếu có sản phẩm)
  if (products.length > 0) {
    const pId = products[0].id;
    console.log(`[6] Mua sản phẩm ${products[0].name} - ID: ${pId}`);
    
    const cartRes = await request('POST', '/cart', { productId: pId, quantity: 1 }, token);
    console.log(`   -> Add to Cart Status: ${cartRes.status}`, cartRes.data);

    console.log(`[7] Đặt Hàng`);
    const orderRes = await request('POST', '/orders', { shippingAddress: '123 Test St', items: [] }, token);
    console.log(`   -> Đặt hàng Status: ${orderRes.status}`, orderRes.data.id || orderRes.data.message);

    if (orderRes.data.id) {
       console.log(`[8] Hủy Đơn`);
       const cancelRes = await request('PATCH', `/orders/${orderRes.data.id}/cancel`, null, token);
       console.log(`   -> Hủy Đơn Status: ${cancelRes.status}`, cancelRes.data.status);
    }
  } else {
    console.log(`[!] Không có sản phẩm nào trong DB để test luồng Mua Hàng! Bạn có thể thêm bằng Admin sau.`);
  }

  console.log('--- KẾT THÚC TEST ---');
}

runTests();
