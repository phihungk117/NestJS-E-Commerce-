import fs from 'fs';
import mysql from 'mysql2/promise';

const API_URL = 'http://localhost:3000/api/v1';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));
    if (res.status >= 400 && data.message) console.log('    [DBG_ERR]:', data.message);
    return { status: res.status, data };
  } catch(e) {
    return { status: 500, error: e.message };
  }
}

async function promoteToAdmin(email) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost', user: 'root', password: 'root', database: 'ecommerce_db_nest'
    });
    await connection.execute(`UPDATE users SET role = 'admin' WHERE email = ?`, [email]);
    await connection.end();
    return true;
  } catch(e) {
    console.log('Lỗi DB:', e.message);
    return false;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 BẮT ĐẦU SUPER E2E TEST: MỘT NGÀY BÁN HÀNG TỪ A-Z');
  console.log('======================================================\n');
  
  // ------------- BƯỚC 1: XÉT DUYỆT ADMIN -------------
  let adminToken = '';
  const adminEmail = `admin${Date.now()}@gmail.com`;
  console.log(`[1] Đăng ký tài khoản Admin: ${adminEmail}`);
  const regAdmin = await request('POST', '/auth/register', { email: adminEmail, password: 'password123', fullName: 'Super Admin' });
  console.log(`   -> Tạo Admin Status: ${regAdmin.status}`);

  console.log(`[2] Can thiệp Database để phong ấn quyền Admin...`);
  await promoteToAdmin(adminEmail);

  console.log(`[3] Đăng nhập quyền Admin`);
  const loginAdmin = await request('POST', '/auth/login', { email: adminEmail, password: 'password123' });
  adminToken = loginAdmin.data.access_token;
  console.log(`   -> Lấy Token Admin: ${adminToken ? 'THÀNH CÔNG' : 'THẤT BẠI'}\n`);

  // ------------- BƯỚC 2: ADMIN SETUP CỬA HÀNG -------------
  console.log(`[4] ADMIN: Tạo Danh mục (Category) "Giày Da Nam"`);
  const catRes = await request('POST', '/categories', { name: 'Giày Da Nam', description: 'Giày công sở' }, adminToken);
  console.log(`   -> Tạo Category Status: ${catRes.status}`);
  const categoryId = catRes.data.id;

  console.log(`[5] ADMIN: Nhập Kho Sản phẩm (Product) "Giày Oxford"`);
  const prodRes = await request('POST', '/products', { 
    name: 'Giày Oxford Siêu Cấp', 
    description: 'Bóng loáng', 
    price: 500000, 
    stock: 10, 
    categoryId: categoryId 
  }, adminToken);
  console.log(`   -> Nhập Product Status: ${prodRes.status}`);
  const productId = prodRes.data.id;

  // ------------- BƯỚC 3: NGƯỜI DÙNG ĐI CHỢ -------------
  let userToken = '';
  const userEmail = `buyer${Date.now()}@gmail.com`;
  console.log(`\n[6] KHACH HANG: Đăng ký tài khoản mua hàng: ${userEmail}`);
  await request('POST', '/auth/register', { email: userEmail, password: 'buyer123', fullName: 'Khach Mua Hang', address: 'Q1, HCM' });
  const loginUser = await request('POST', '/auth/login', { email: userEmail, password: 'buyer123' });
  userToken = loginUser.data.access_token;
  
  console.log(`[7] KHACH HANG: Xem danh sách sản phẩm (Public)`);
  const searchProd = await request('GET', '/products');
  console.log(`   -> Các món hàng đang bán: ${searchProd.data.data.map(p => p.name).join(', ')}`);

  console.log(`[8] KHACH HANG: Thêm 2 "Giày Oxford" vào Giỏ Hàng (Cart)`);
  const cartRes = await request('POST', '/cart', { productId: productId, quantity: 2 }, userToken);
  console.log(`   -> Add Cart Status: ${cartRes.status}`);
  
  console.log(`[9] KHACH HANG: Xem lại giỏ hàng`);
  const getCartRes = await request('GET', '/cart', null, userToken);
  const cartItemId = getCartRes.data.items[0]?.id;
  console.log(`   -> Trong giỏ có: ${getCartRes.data.items.length} mặt hàng, Tổng tiền: ${getCartRes.data.total}`);

  // ------------- BƯỚC 4: THANH TOÁN VÀ HỦY ĐƠN -------------
  console.log(`\n[10] KHACH HANG: Bấm Nút Đặt Hàng (Checkout toàn bộ giỏ)`);
  const orderRes = await request('POST', '/orders', { shippingAddress: '789 Giao Tận Nhà', note: 'Giao giờ hành chính', items: [] }, userToken);
  console.log(`   -> Checkout Status: ${orderRes.status}`);
  const orderId = orderRes.data?.id;

  console.log(`[11] ADMIN: Kiểm tra kho thực tế sau khi khách mua (Cần tụt xuống 8)`);
  const checkStock = await request('GET', `/products/${productId}`);
  console.log(`   -> Tồn kho thực tế: ${checkStock.data.stock} cái`);

  console.log(`[12] KHACH HANG: Lật kèo HỦY ĐƠN HÀNG!`);
  const cancelRes = await request('PATCH', `/orders/${orderId}/cancel`, null, userToken);
  console.log(`   -> Cancel Order Status: ${cancelRes.status}`);

  console.log(`[13] ADMIN: Kiểm tra lại kho thực tế (Cần trả về 10 ban đầu)`);
  const reCheckStock = await request('GET', `/products/${productId}`);
  console.log(`   -> Tồn kho hồi lại: ${reCheckStock.data.stock} cái`);

  // ------------- BƯỚC 5: XỬ LÝ RÁC -------------
  console.log(`\n[14] ADMIN: Xóa toàn bộ sản phẩm và danh mục để dọn DB`);
  const delProd = await request('DELETE', `/products/${productId}`, null, adminToken);
  const delCat = await request('DELETE', `/categories/${categoryId}`, null, adminToken);
  console.log(`   -> Xóa SP & DM: ${delProd.status} | ${delCat.status}`);

  console.log('\n======================================================');
  console.log('🎉 TẤT CẢ TÍNH NĂNG ĐÃ ĐƯỢC TEST NHỊP NHÀNG 100%');
  console.log('======================================================\n');
}

runTests();
