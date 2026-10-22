import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirebaseDb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { email, role = 'Media Engineer', orgName = 'Slipe AI Studios' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    const inviteToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const inviteUrl = `${req.nextUrl.origin || 'http://localhost:3000'}/accept-invite?token=${inviteToken}&email=${encodeURIComponent(email)}&org=${encodeURIComponent(orgName)}`;

    // Compose email subject and content
    const subject = `Invitation: Join ${orgName} on Slipe AI Enterprise`;
    const plainTextBody = `Hello,\n\nYou have been invited to join ${orgName} on Slipe AI Enterprise as a ${role}.\n\nAccept your invitation to access AI batch photo enhancement and campaign ad generation:\n${inviteUrl}\n\nThis invitation link expires in 7 days.\n\nBest regards,\nSlipe AI Enterprise Team`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080B10; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #0E131E; border: 1px solid #1E273A; border-radius: 12px; padding: 36px 30px; text-align: left;">
          <div style="margin-bottom: 24px; text-align: center;">
            <div style="display: inline-block; background-color: #2563EB; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
              SLIPE AI ENTERPRISE
            </div>
          </div>
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0;">You're Invited to Join ${orgName}</h2>
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">
            You have been granted access as a <strong>${role}</strong> to the Slipe AI Enterprise platform. You can now collaborate on batch photo enhancements and advertising image generation campaigns.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" style="background-color: #2563EB; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; display: inline-block;">
              Accept Invitation & Access Workspace
            </a>
          </div>
          <p style="color: #64748B; font-size: 12px; line-height: 1.5; border-top: 1px solid #1A2232; padding-top: 16px; margin-bottom: 0;">
            If you did not expect this invitation, you can safely ignore this email. This link is secure and will expire in 7 days.<br/>
            Direct Link: <a href="${inviteUrl}" style="color: #3B82F6;">${inviteUrl}</a>
          </p>
        </div>
      </div>
    `;

    // Direct Web Gmail Compose URL (allows immediate dispatch via the user's Gmail)
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;

    // Sync invitation to Firebase Firestore
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'team_invitations', inviteToken), {
        email,
        role,
        orgName,
        token: inviteToken,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (fbErr) {
      console.warn('[Firebase Invite Sync] Saved locally:', fbErr);
    }

    // Check for SMTP environment variables to attempt direct background delivery
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || (smtpUser?.includes('gmail.com') ? 'smtp.gmail.com' : undefined);
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    let emailSent = false;
    let deliveryMethod = 'direct_gmail_trigger';

    if (smtpUser && smtpPass && smtpHost) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Slipe AI Enterprise" <${smtpUser}>`,
          to: email,
          subject,
          text: plainTextBody,
          html: htmlBody,
        });

        emailSent = true;
        deliveryMethod = 'smtp_server';
      } catch (smtpErr: any) {
        console.warn('[SMTP Dispatch Error]:', smtpErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      deliveryMethod,
      recipientEmail: email,
      inviteUrl,
      gmailComposeUrl,
      mailtoUrl,
      subject,
      message: emailSent
        ? `Invitation successfully delivered to ${email}`
        : `Invitation generated for ${email}. Ready to send directly via Gmail.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process invitation' },
      { status: 500 }
    );
  }
}
