const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure environment variables for your Gmail account
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendWithdrawalRequestEmail = functions.firestore
  .document("withdrawalRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
      from: "AddMint Platform <noreply@addmint.com>",
      to: "apknixy@gmail.com",
      subject: `New Withdrawal Request from ${data.username}`,
      html: `
        <h1>Withdrawal Request Details</h1>
        <p><strong>User ID:</strong> ${data.userId}</p>
        <p><strong>Username:</strong> @${data.username}</p>
        <p><strong>Views to Withdraw:</strong> ${data.views.toLocaleString()}</p>
        <p><strong>Payment ID (PayPal/UPI):</strong> ${data.paymentId}</p>
        <p><strong>Timestamp:</strong> ${data.timestamp.toDate().toString()}</p>
      `,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log("Withdrawal request email sent successfully.");
      return snap.ref.set({ emailStatus: "sent" }, { merge: true });
    } catch (error) {
      console.error("There was an error while sending the email:", error);
      return snap.ref.set({ emailStatus: "error" }, { merge: true });
    }
  });
