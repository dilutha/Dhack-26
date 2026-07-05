import nodemailer from 'nodemailer';
import { logger } from './logger';

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      logger.error('Email send error: Missing Gmail credentials');
      return { success: false, error: 'Missing Gmail credentials' } as const;
    }

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"DHack" <${gmailUser}>`,
      to,
      subject,
      html: html || undefined,
      text: text || (html ? stripHtmlToText(html) : undefined),
    });

    logger.info('Email sent successfully', { messageId: info.messageId });
    return { success: true, data: info } as const;
  } catch (err) {
    logger.error('Email send exception', err);
    return { success: false, error: err } as const;
  }
}

function stripHtmlToText(html: string): string {
  try {
    const withoutTags = html
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>(\n)?/gi, '\n')
      .replace(/<\/(p|div|h\d|li)>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return withoutTags;
  } catch {
    return html;
  }
}

export function generateRegistrationConfirmationEmail(
  teamName: string,
  teamId: string,
  members: { full_name: string; email: string; is_leader: boolean }[]
) {
  const leader = members.find(m => m.is_leader);
  const otherMembers = members.filter(m => !m.is_leader);

  const memberList = members
    .map(
      m => `
      <div class="member-item" style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: #1f2937; font-weight: 500;">${m.full_name}</span>
      </div>
    `
    )
    .join('');

  const subject = `🎉 Registration Confirmed - ${teamName} | DHack'26`;
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed - DHack'26</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; margin: 0 !important; }
            .header { padding: 20px 15px !important; }
            .content { padding: 20px 15px !important; }
            .grid-2 { grid-template-columns: 1fr !important; gap: 15px !important; }
            .member-item { flex-direction: column !important; align-items: flex-start !important; gap: 5px !important; }
            .member-email { margin-left: 0 !important; margin-top: 5px !important; }
            .cta-button { width: 100% !important; text-align: center !important; }
            .footer { padding: 20px 15px !important; }
            .logo-text { font-size: 32px !important; }
            .main-title { font-size: 24px !important; }
            .section-title { font-size: 18px !important; }
            .info-box { padding: 15px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Orbitron', 'Exo 2', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Text Logo -->
          <div class="header" style="background: linear-gradient(135deg, #0F101E 0%, #1a1b2e 100%); padding: 30px 40px; text-align: center;">
            <div class="logo-text" style="font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 900; color: #ffffff; margin-bottom: 10px; text-shadow: 0 0 20px rgba(241, 140, 36, 0.5);">DHack</div>
            <h1 class="main-title" style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome to DHack'26!</h1>
            <p style="color: #a1a1aa; margin: 10px 0 0 0; font-size: 16px;">Organised by S@IT | USJP</p>
          </div>

          <!-- Main Content -->
          <div class="content" style="padding: 40px;">
            <!-- Success Message -->
            <div class="info-box" style="background: linear-gradient(135deg, #F18C24, #1EC0C3); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">🎉 Registration Successful!</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your team has been successfully registered for DHack'26</p>
            </div>

            <!-- Team Information -->
            <div class="info-box" style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 class="section-title" style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Team Information</span>
              </h3>
              <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">TEAM NAME</p>
                  <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${teamName}</p>
                </div>
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">TEAM ID</p>
                  <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600; font-family: monospace;">${teamId}</p>
                </div>
              </div>
            </div>

            <!-- Team Members -->
            <div class="info-box" style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 class="section-title" style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Team Members</span>
              </h3>
              <div style="space-y: 0;">
                ${memberList}
              </div>
            </div>

            <!-- Important Notes -->
            <div class="info-box" style="background: linear-gradient(135deg, #1EC0C3, #28A7A9); color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Important Information</h3>
              <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.9);">
                <li style="margin-bottom: 8px;">Keep this email for your records - you'll need your Team ID for submissions</li>
                <li style="margin-bottom: 8px;">All team communications will be sent to the team leader: <strong>${leader?.full_name}</strong></li>
                <li style="margin-bottom: 8px;">Check our website regularly for updates and announcements</li>
                <li style="margin-bottom: 0;">Good luck with your hackathon journey! 🚀</li>
              </ul>
            </div>

            <!-- Call to Action -->
            <div class="cta-button" style="text-align: center; margin-bottom: 30px;">
              <a href="https://dhack.lk" style="display: inline-block; background: linear-gradient(135deg, #F18C24, #1EC0C3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(241, 140, 36, 0.3);">
                Visit DHack Website
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer" style="background-color: #0F101E; color: #a1a1aa; padding: 30px 40px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">© 2026 DHack - Organised by S@IT | USJP</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `DHack — Organised by S@IT | USJP\n\nRegistration Successful\n\nTeam: ${teamName}\nTeam ID: ${teamId}\n\nMembers:\n${members
    .map(m => `- ${m.full_name}`)
    .join(
      '\n'
    )}\n\nImportant:\n- Keep this email for your records.\n- All communications go to the team leader.\n- Check our website for updates.\n\nVisit: https://dhack.lk\n© 2026 DHack`;

  return { subject, html, text };
}

export function generateSubmissionConfirmationEmail(
  teamName: string,
  roundName: string,
  submittedBy: string,
  members: { full_name: string; email: string; is_leader: boolean }[]
) {
  const leader = members.find(m => m.is_leader);
  const memberList = members
    .map(
      m => `
      <div class="member-item" style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: #1f2937; font-weight: 500;">${m.full_name}</span>
      </div>
    `
    )
    .join('');

  const subject = `✅ Submission Confirmed - ${teamName} | ${roundName} | DHack'26`;
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Submission Confirmed - DHack'26</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; margin: 0 !important; }
            .header { padding: 20px 15px !important; }
            .content { padding: 20px 15px !important; }
            .grid-2 { grid-template-columns: 1fr !important; gap: 15px !important; }
            .member-item { flex-direction: column !important; align-items: flex-start !important; gap: 5px !important; }
            .member-email { margin-left: 0 !important; margin-top: 5px !important; }
            .cta-button { width: 100% !important; text-align: center !important; }
            .footer { padding: 20px 15px !important; }
            .logo-text { font-size: 32px !important; }
            .main-title { font-size: 24px !important; }
            .section-title { font-size: 18px !important; }
            .info-box { padding: 15px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Orbitron', 'Exo 2', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Text Logo -->
          <div class="header" style="background: linear-gradient(135deg, #0F101E 0%, #1a1b2e 100%); padding: 30px 40px; text-align: center;">
            <div class="logo-text" style="font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 900; color: #ffffff; margin-bottom: 10px; text-shadow: 0 0 20px rgba(241, 140, 36, 0.5);">DHack</div>
            <h1 class="main-title" style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Submission Received!</h1>
            <p style="color: #a1a1aa; margin: 10px 0 0 0; font-size: 16px;">DHack'26 Round Submission Confirmation</p>
          </div>

          <!-- Main Content -->
          <div class="content" style="padding: 40px;">
            <!-- Success Message -->
            <div class="info-box" style="background: linear-gradient(135deg, #1EC0C3, #28A7A9); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">✅ Submission Successful!</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your team's submission has been received and recorded</p>
            </div>

            <!-- Submission Details -->
            <div class="info-box" style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 class="section-title" style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Submission Details</span>
              </h3>
              <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">ROUND</p>
                  <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${roundName}</p>
                </div>
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">TEAM</p>
                  <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${teamName}</p>
                </div>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">SUBMITTED BY</p>
                <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${submittedBy}</p>
              </div>
            </div>

            <!-- Team Members -->
            <div class="info-box" style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 class="section-title" style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: linear-gradient(135deg, #F18C24, #1EC0C3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Team Members</span>
              </h3>
              <div style="space-y: 0;">
                ${memberList}
              </div>
            </div>

            <!-- Next Steps -->
            <div class="info-box" style="background: linear-gradient(135deg, #F18C24, #1EC0C3); color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.9);">
                <li style="margin-bottom: 8px;">Your submission is now under review by our judging panel</li>
                <li style="margin-bottom: 8px;">Results will be announced on our website and social media</li>
                <li style="margin-bottom: 8px;">Team leader <strong>${leader?.full_name}</strong> will receive all updates</li>
                <li style="margin-bottom: 0;">Keep an eye on your email for further instructions! 📧</li>
              </ul>
            </div>

            <!-- Call to Action -->
            <div class="cta-button" style="text-align: center; margin-bottom: 30px;">
              <a href="https://dhack.lk" style="display: inline-block; background: linear-gradient(135deg, #F18C24, #1EC0C3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(241, 140, 36, 0.3);">
                Check Results & Updates
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer" style="background-color: #0F101E; color: #a1a1aa; padding: 30px 40px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">© 2026 DHack - Organised by S@IT | USJP</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `DHack — Organised by S@IT | USJP\n\nSubmission Received\n\nTeam: ${teamName}\nRound: ${roundName}\nSubmitted By: ${submittedBy}\n\nTeam Members:\n${members
    .map(m => `- ${m.full_name}`)
    .join(
      '\n'
    )}\n\nNext Steps:\n- Your submission is under review.\n- Results will be announced on our website and social media.\n- The team leader will receive updates.\n\nCheck updates: https://dhack.lk\n© 2026 DHack`;

  return { subject, html, text };
}
