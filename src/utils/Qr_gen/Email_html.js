export const htmlContent = (username, eventname, eventdate) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event QR Code</title>
    <style>
      /* General reset */
      body, table, td, a {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }

      img {
        border: none;
        display: block;
      }

      /* Body styles */
      body {
        background-color: #f4f7f9;
        color: #333;
        padding: 20px;
      }

      /* Main email container */
      .email-container {
        background-color: #ffffff;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
      }

      /* Header section */
      .header {
        background-color: #4CAF50;
        padding: 20px;
        color: #ffffff;
        text-align: center;
        border-radius: 8px;
      }

      .header h1 {
        font-size: 26px;
        margin-bottom: 10px;
      }

      .header p {
        font-size: 16px;
        margin: 0;
      }

      /* Main content */
      .content {
        padding: 20px;
        text-align: left;
      }

      .content h2 {
        font-size: 22px;
        color: #333;
        margin-bottom: 10px;
      }

      .content p {
        font-size: 16px;
        line-height: 1.5;
        color: #555;
      }

      /* QR code section */
      .qr-container {
        text-align: center;
        margin: 20px 0;
      }

      .qr-container img {
        max-width: 200px;
        border-radius: 8px;
        border: 2px solid #ddd;
      }

      /* Footer section */
      .footer {
        text-align: center;
        font-size: 14px;
        color: #777;
        margin-top: 20px;
      }

      .footer p {
        margin: 0;
      }

      .footer a {
        color: #4CAF50;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header Section -->
      <div class="header">
        <h1>🎉 Your Event QR Code</h1>
        <p>Thank you for registering for our event!</p>
      </div>

      <!-- Content Section -->
      <div class="content">
        <h2>Hello <strong>${username}</strong>,</h2>
        <p>We are thrilled to confirm your registration for <strong>${eventname}</strong> on <strong>${eventdate}</strong>.</p>
        <p>Below is your QR code for easy entry to the event. Please present this QR code at the event check-in:</p>

        <!-- QR Code -->
        <div class="qr-container">
          <img src="cid:qrimage" alt="Your Event QR Code" />
        </div>

        <p>If you have any questions or need assistance, feel free to <a href="${process.env.EMAILSENDER}">contact us</a>.</p>

        <p>We look forward to seeing you at the event!</p>
      </div>

      <!-- Footer Section -->
      <div class="footer">
        <p>Best regards, <br><strong>Event Team</strong></p>
      </div>
    </div>
  </body>
  </html>
`;
