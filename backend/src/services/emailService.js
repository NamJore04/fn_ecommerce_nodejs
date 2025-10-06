const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Email sending will fail.');
    console.warn('Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }
  
  console.log('📧 Email Service Configuration:', {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || 'namhuynhfree@gmail.com',
    hasPassword: !!process.env.EMAIL_PASS,
    passwordLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
  });
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates in development
    }
  });
  
  return transporter;
};

// Send email
const sendEmail = async (options) => {
  try {
    console.log('📧 Attempting to send email:', {
      to: options.email,
      subject: options.subject,
      from: process.env.EMAIL_USER
    });
    
    const transporter = createTransporter();
    
    // Test connection first
    await transporter.verify();
    console.log('✅ Email server connection verified');
    
    const mailOptions = {
      from: `"TechStore" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Email server connection failed. Please check your network connection.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Email server timeout. Please try again later.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🛒 TechStore</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Chào mừng ${user.fullName}! 🎉</h2>
        <p style="color: #666; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại TechStore. Chúng tôi rất vui được chào đón bạn!</p>
        <p style="color: #666; line-height: 1.6;">Bạn có thể khám phá bộ sưu tập máy tính và linh kiện máy tính của chúng tôi.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${clientUrl}/products" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Bắt Đầu Mua Sắm</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: 'Chào Mừng Đến TechStore!',
    html: message
  });
};

// Send email verification
const sendEmailVerification = async (user, verificationUrl) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✉️ Xác Nhận Email</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Xin chào ${user.fullName},</h2>
        <p style="color: #666; line-height: 1.6;">Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Xác Nhận Email</a>
        </div>
        
        <p style="color: #999; font-size: 12px;">Liên kết này sẽ hết hạn sau 24 giờ.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: 'Xác Nhận Email - TechStore',
    html: message
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🔐 Đặt Lại Mật Khẩu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Xin chào ${user.fullName},</h2>
        <p style="color: #666; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TechStore.</p>
        <p style="color: #666; line-height: 1.6;">Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Đặt Lại Mật Khẩu</a>
        </div>
        
        <p style="color: #dc3545; font-size: 14px; font-weight: bold;">⚠️ Liên kết này sẽ hết hạn sau 10 phút.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: 'Đặt Lại Mật Khẩu - TechStore',
    html: message
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🛒 Xác Nhận Đơn Hàng</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Cảm ơn bạn, ${user.fullName}! 🎉</h2>
        <p style="color: #666; line-height: 1.6;">Đơn hàng của bạn đã được xác nhận.</p>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📦 Chi Tiết Đơn Hàng</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${order.orderNumber}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          <p style="color: #28a745; margin: 5px 0; font-size: 18px;"><strong>Tổng tiền:</strong> ${typeof order.total === 'number' ? order.total.toLocaleString('vi-VN') : order.total} VND</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">🛍️ Sản Phẩm Đã Đặt</h3>
          ${order.items.map(item => `
            <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #666;">• ${item.productName} - ${item.variantName}</span><br>
              <span style="color: #999; font-size: 12px;">Số lượng: ${item.quantity} | Giá: ${typeof item.total === 'number' ? item.total.toLocaleString('vi-VN') : item.total} VND</span>
            </div>
          `).join('')}
        </div>
        
        ${order.shippingAddress ? `
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📍 Địa Chỉ Giao Hàng</h3>
          <p style="color: #666; margin: 0;">
            ${order.shippingAddress.fullName || ''}<br>
            ${order.shippingAddress.street || ''}<br>
            ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}<br>
            ${order.shippingAddress.country || 'Vietnam'}
          </p>
        </div>
        ` : ''}
        
        <p style="color: #666; line-height: 1.6;">Chúng tôi sẽ gửi email thông báo khi đơn hàng được giao.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Cảm ơn bạn đã mua sắm tại TechStore!</p>
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: `Xác Nhận Đơn Hàng - ${order.orderNumber}`,
    html: message
  });
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (user, order, newStatus) => {
  const statusMessages = {
    pending: 'Đơn hàng đang chờ xử lý',
    confirmed: 'Đơn hàng đã được xác nhận và đang chuẩn bị',
    processing: 'Đơn hàng đang được xử lý',
    shipping: 'Đơn hàng đang được giao đến bạn! 🚚',
    delivered: 'Đơn hàng đã được giao thành công! ✅',
    cancelled: 'Đơn hàng đã bị hủy',
    returned: 'Đơn hàng đã được hoàn trả'
  };
  
  const statusColors = {
    pending: '#ffc107',
    confirmed: '#17a2b8',
    processing: '#007bff',
    shipping: '#6f42c1',
    delivered: '#28a745',
    cancelled: '#dc3545',
    returned: '#6c757d'
  };
  
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, ${statusColors[newStatus] || '#007bff'} 0%, ${statusColors[newStatus] || '#007bff'}aa 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📦 Cập Nhật Đơn Hàng</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Xin chào ${user.fullName},</h2>
        <p style="color: #666; line-height: 1.6;">Trạng thái đơn hàng của bạn đã được cập nhật.</p>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0;">Mã đơn hàng: <strong>${order.orderNumber}</strong></p>
          <div style="margin: 20px 0;">
            <span style="background: ${statusColors[newStatus] || '#007bff'}; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; font-size: 16px;">
              ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">${statusMessages[newStatus] || 'Trạng thái đã được cập nhật.'}</p>
        </div>
        
        ${newStatus === 'shipping' && order.trackingNumber ? `
          <div style="background: #e7f5ff; border: 1px solid #b8daff; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #004085; margin-top: 0;">🚚 Thông Tin Vận Chuyển</h3>
            <p style="color: #004085; margin: 5px 0;"><strong>Mã vận đơn:</strong> ${order.trackingNumber}</p>
            ${order.carrier ? `<p style="color: #004085; margin: 5px 0;"><strong>Đơn vị vận chuyển:</strong> ${order.carrier}</p>` : ''}
          </div>
        ` : ''}
        
        ${newStatus === 'delivered' ? `
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #155724; font-size: 16px; margin: 0;">🎉 Đơn hàng đã giao thành công! Cảm ơn bạn đã mua sắm tại TechStore!</p>
          </div>
        ` : ''}
        
        ${newStatus === 'cancelled' ? `
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="color: #721c24; margin: 0;">Nếu bạn có thắc mắc về việc hủy đơn hàng, vui lòng liên hệ với chúng tôi.</p>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Cảm ơn bạn đã mua sắm tại TechStore!</p>
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: `Cập Nhật Đơn Hàng - ${order.orderNumber}`,
    html: message
  });
};

// Send low stock alert email (for admin)
const sendLowStockAlertEmail = async (adminEmail, products) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ Cảnh Báo Hàng Tồn Kho Thấp</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <p style="color: #666; line-height: 1.6;">Các sản phẩm sau đây đang sắp hết hàng:</p>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          ${products.map(product => `
            <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #333; font-weight: bold;">• ${product.name}</span> - ${product.variantName}<br>
              <span style="color: #dc3545; font-weight: bold;">Còn lại: ${product.stock} sản phẩm</span>
            </div>
          `).join('')}
        </div>
        
        <p style="color: #666; line-height: 1.6;">Vui lòng bổ sung hàng cho các sản phẩm trên.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">TechStore Admin System</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: adminEmail,
    subject: '⚠️ Cảnh Báo Hàng Tồn Kho Thấp - TechStore',
    html: message
  });
};

// Send new order notification email (for admin)
const sendNewOrderNotificationEmail = async (adminEmail, order) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Đơn Hàng Mới!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <p style="color: #666; line-height: 1.6;">Một đơn hàng mới vừa được đặt:</p>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📦 Chi Tiết Đơn Hàng</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${order.orderNumber}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Khách hàng:</strong> ${order.customerName}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          <p style="color: #28a745; margin: 5px 0; font-size: 18px;"><strong>Tổng tiền:</strong> ${typeof order.total === 'number' ? order.total.toLocaleString('vi-VN') : order.total} VND</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">🛍️ Sản Phẩm Đã Đặt</h3>
          ${order.items.map(item => `
            <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #666;">• ${item.productName} - ${item.variantName}</span><br>
              <span style="color: #999; font-size: 12px;">Số lượng: ${item.quantity} | Giá: ${typeof item.total === 'number' ? item.total.toLocaleString('vi-VN') : item.total} VND</span>
            </div>
          `).join('')}
        </div>
        
        <p style="color: #dc3545; font-weight: bold;">⏰ Vui lòng xử lý đơn hàng này sớm nhất có thể.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">TechStore Admin System</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: adminEmail,
    subject: `🎉 Đơn Hàng Mới - ${order.orderNumber}`,
    html: message
  });
};

// Send newsletter email
const sendNewsletterEmail = async (subscribers, subject, content) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📬 ${subject}</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <div style="color: #666; line-height: 1.8;">${content}</div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${clientUrl}/products" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Khám Phá Ngay</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Bạn nhận được email này vì đã đăng ký nhận tin từ TechStore.<br>
          <a href="${clientUrl}/unsubscribe" style="color: #999;">Hủy đăng ký</a>
        </p>
        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 TechStore. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const promises = subscribers.map(subscriber => 
    sendEmail({
      email: subscriber.email,
      subject: subject,
      html: message
    })
  );
  
  return Promise.all(promises);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendLowStockAlertEmail,
  sendNewOrderNotificationEmail,
  sendNewsletterEmail
};
