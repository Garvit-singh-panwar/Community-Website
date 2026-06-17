import nodemailer from "nodemailer";
import { Env } from "./Env.js";

// creating the Transporter 

const transporter = nodemailer.createTransport({
  service: "gmail", // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: Env.USER_EMAIL,
    pass: Env.USER_PASS,
  },
});


// verifying the transporter 
try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}


// sending the email 
export const sendRegisterationOTP = async(username , email , otp)=>{
    try {


        const html = registerHtml(username , otp);



        const mailOPtions = { 
            from: `"campusVOLT Team" <${Env.USER_MAIL}>`, // sender address
            to: email, // list of recipients
            subject: "otp for registration", // subject line
            html: html, // HTML body
        }

        const info = await transporter.sendMail(
            mailOPtions
        );

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
    } catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
}


// sending the Html file 

const registerHtml = (username , otp )=>{


    const html = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your OTP</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, a { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333333; }

        /* Custom Styles */
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; text-align: center; }
        .greeting { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 15px; text-align: left; }
        .intro-text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; text-align: left; }
        
        /* OTP Box */
        .otp-container { background-color: #f3f4f6; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; margin: 25px auto; max-width: 280px; letter-spacing: 6px; }
        .otp-code { font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0; padding-left: 6px; /* offsets the last letter-spacing */ }
        
        /* Features Section */
        .features { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: left; }
        .features-title { font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .feature-item { font-size: 13px; color: #4b5563; margin: 5px 0; display: flex; align-items: center; }
        
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.5; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f9; padding: 20px 0;">
        <tr>
            <td>
                <div class="email-container">
                    
                    <!-- Header -->
                    <div class="header">
                        <h1>CampusVolt</h1>
                        <p>Notes • Quizzes • Hackathons • Contests</p>
                    </div>

                    <!-- Content Body -->
                    <div class="content">
                        <div class="greeting">Hello ${username}, 👋</div>
                        
                        <p class="intro-text">
                            Thank you for being a part of our growing community! Whether you are here to crush your exams with shared notes and PYQs, or ready to dominate the next big hackathon, we are thrilled to have you onboard. 
                            <br><br>
                            Please use the One-Time Password (OTP) below to verify your identity and access your account.
                        </p>

                        <!-- OTP Box -->
                        <div class="otp-container">
                            <!-- Backend/Admin can dynamically replace '849205' with the generated OTP -->
                            <div class="otp-code">${otp}</div>
                        </div>

                        <p style="font-size: 13px; color: #9ca3af; margin-top: 25px;">
                            This OTP is valid for the next <b>10 minutes</b>. Please do not share this code with anyone.
                        </p>

                        <!-- Community Perks Block -->
                        <div class="features">
                            <div class="features-title">What's happening right now:</div>
                            <div class="feature-item">📚 Access the latest shared Notes & Syllabus</div>
                            <div class="feature-item">📝 Practice with community-uploaded PYQs</div>
                            <div class="feature-item">🏆 Live Admins are hosting weekly Quizzes & Coding Contests</div>
                            <div class="feature-item">🚀 Registrations open for the upcoming Hackathon!</div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>You received this email because you registered on our community platform.</p>
                        <p>&copy; 2026 campusVOLT Platform. All rights reserved.</p>
                        <p>Need help? <a href="#">Contact Support</a></p>
                    </div>

                </div>
            </td>
        </tr>
    </table>

</body>
</html>
    `

    return html;

} ;