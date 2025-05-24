const emailService = require('../services/emailService');

const emailController = {
  getEmailList: async (req, res) => {
    try {
      const emails = await emailService.getEmails();
      console.log(emails);
      res.status(200).send("ok");

    } catch (error) {
      console.error('Lỗi khi lấy danh sách email:', error.message);
      res.status(500).send('Lỗi khi lấy danh sách email');
    }
  },

  getMailDetails: async (req, res) => {
    try {
      const mailId = req.params.id;
      const mailDetails = await emailService.getMailDetails(mailId);
      res.status(200).send("ok");
    } catch (error) {
      res.render('error', {
        title: 'Lỗi',
        message: 'Không thể lấy danh sách thư',
        error: error.message
      });
    }
  },

  getMessageContent: async (req, res) => {
    try {
      const messageId = req.params.id;
      const messageContent = await emailService.getMessageContent(messageId);
      res.status(200).send("ok");
    } catch (error) {
      res.render('error', {
        title: 'Lỗi',
        message: 'Không thể đọc nội dung thư',
        error: error.message
      });
    }
  },

  getCode: async (req, res) => {
  try {
    const { email, service } = req.body;
    console.log('Yêu cầu lấy mã:', { email, service });

    if (!email || !service) {
      return res.status(400).json({
        success: false,
        message: 'Email và tên dịch vụ là bắt buộc'
      });
    }

    const result = await emailService.getCode(email, service);

    if (!result.success || !Array.isArray(result.data)) {
      return res.status(404).json({
        success: false,
        message: 'Không có dữ liệu hợp lệ'
      });
    }

    // Chuẩn hóa: bỏ ký tự đặc biệt và chuyển về thường
    const normalize = (text) => text?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    const target = normalize(service);

    // Tìm email hợp lệ nhất (theo thời gian) và liên quan đến service
    const sortedEmails = result.data.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    let code = null;

    for (const mail of sortedEmails) {
      const subjectNorm = normalize(mail.subject);
      const fromNorm = normalize(mail.from);

      // Chỉ tiếp tục nếu subject hoặc from chứa tên service
      const isRelated =
        subjectNorm.includes(target) ||
        fromNorm.includes(target);

      if (!isRelated) continue;

      // Ưu tiên tìm mã trong subject
      const subjectMatch = mail.subject.match(/\b\d{6,8}\b/);
      if (subjectMatch) {
        code = subjectMatch[0];
        break;
      }
    }
    if (code) {
      console.log('Mã tìm thấy:', code);
      return res.status(200).json({
        success: true,
        code
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã phù hợp từ email liên quan đến dịch vụ yêu cầu'
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy mã:', error.message);    return res.status(500).json({
      success: false,
      message: 'Lỗi nội bộ khi xử lý mã',
      error: error.message
    });
  }
  },

  showGetCodeForm: async (req, res) => {
    // Render the index.hbs view for the code retrieval form
    res.render('index');
  }

};

module.exports = emailController;
