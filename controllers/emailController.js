const emailService = require("../services/emailService");

const emailController = {
  getEmailList: async (req, res) => {
    try {
      const emails = await emailService.getEmails();
      console.log(emails);
      res.status(200).send("ok");
    } catch (error) {
      console.error("Lỗi khi lấy danh sách email:", error.message);
      res.status(500).send("Lỗi khi lấy danh sách email");
    }
  },

  getMailDetails: async (req, res) => {
    try {
      const mailId = req.params.id;
      const mailDetails = await emailService.getMailDetails(mailId);
      res.status(200).send("ok");
    } catch (error) {
      res.render("error", {
        title: "Lỗi",
        message: "Không thể lấy danh sách thư",
        error: error.message,
      });
    }
  },

  getMessageContent: async (req, res) => {
    try {
      const messageId = req.params.id;
      const messageContent = await emailService.getMessageContent(messageId);
      res.status(200).send("ok");
    } catch (error) {
      res.render("error", {
        title: "Lỗi",
        message: "Không thể đọc nội dung thư",
        error: error.message,
      });
    }
  },
  getCode: async (req, res) => {
    try {
      const { email, service } = req.body;
      console.log("Yêu cầu lấy mã:", { email, service });

      if (!email || !service) {
        return res.status(400).json({
          success: false,
          message: "Email và tên dịch vụ là bắt buộc",
        });
      }

      const emailsResponse = await emailService.getEmails();
      if (!emailsResponse?.success || !Array.isArray(emailsResponse.data)) {
        return res.status(500).json({
          success: false,
          message: "Không thể lấy danh sách email",
        });
      }

      const matchingEmail = emailsResponse.data.find(
        (item) => item.email?.toLowerCase() === email.toLowerCase()
      );

      if (!matchingEmail) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy email: ${email}`,
        });
      }

      const mailId = matchingEmail.id;
      const mailDetailsResponse = await emailService.getMailDetails(mailId);

      if (
        !mailDetailsResponse?.success ||
        !Array.isArray(mailDetailsResponse.data?.items)
      ) {
        return res.status(500).json({
          success: false,
          message: "Không thể lấy chi tiết mail",
        });
      }

      const items = mailDetailsResponse.data.items;
      const now = new Date();

      const recentMessage = items
        .filter((item) => {
          if (!item.created_at) return false;
          const createdAt = new Date(item.created_at);
          const diffMs = now - createdAt;
          return diffMs >= 0 && diffMs <= 5 * 60 * 1000;
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      if (!recentMessage) {
        return res.status(404).json({
          success: false,
          message: "Không có tin nhắn nào trong vòng 5 phút gần nhất",
        });
      }

      console.log("Tin nhắn hợp lệ gần nhất:", recentMessage);
      const subject = recentMessage.subject || "";

      if (service === "grok") {
        const match = subject.match(/\b([A-Z]{3}-[A-Z]{3})\b/); // VD: VAN-SWD
        if (!match) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy mã định dạng VAN-SWD trong subject",
          });
        }
        console.log("Mã Grok tìm thấy là:", match[1]);
        return res.status(200).json({
          success: true,
          code: match[1],
        });
      }

      if (service === "chatgpt") {
        const match = subject.match(/\b(\d{6})\b/); // Mã 6 số
        if (!match) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy mã 6 số trong subject",
          });
        }
        console.log("Mã chatgpt tìm thấy là:", match[1]);
        return res.status(200).json({
          success: true,
          code: match[1],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Tin nhắn lấy thành công",
        message_id: recentMessage.id,
      });
    } catch (error) {
      console.error("Lỗi khi lấy mã:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi nội bộ khi xử lý mã",
        error: error.message,
      });
    }
  },

  showGetCodeForm: async (req, res) => {
    // Render the index.hbs view for the code retrieval form
    res.render("index");
  },
};

module.exports = emailController;
