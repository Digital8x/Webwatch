import nodemailer from 'nodemailer';
import { getSettings } from './db';
import { Monitor, Incident } from '@/types';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(settings: any) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
      connectionTimeout: 10000,
    });
  }
  return transporter;
}

export async function sendEmailAlert(monitor: Monitor, incident?: Incident, isRecovery: boolean = false) {
  const settings = getSettings().notifications;

  if (!settings.emailEnabled || !settings.emailAddress || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    console.log('Email notifications are disabled or incomplete settings (missing host, user, or pass).');
    return false;
  }

  // Create or get transporter
  const transporterInstance = getTransporter(settings);

  // Handle multiple email addresses separated by commas
  const toAddresses = settings.emailAddress
    .split(',')
    .map((email: string) => email.trim())
    .filter((email: string) => email.length > 0)
    .join(', ');

  if (!toAddresses) {
    console.log(`Email recipient list is empty after parsing: "${settings.emailAddress}"`);
    return false;
  }

  const subject = isRecovery 
    ? `✅ RECOVERED: ${monitor.name} is back online` 
    : `🚨 DOWN: ${monitor.name} is offline`;

  const safeMonitorName = escapeHtml(monitor.name);
  const safeMonitorUrl = escapeHtml(monitor.url);
  const safeIncidentCause = incident ? escapeHtml(incident.cause) : '';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${isRecovery ? '#10b981' : '#ef4444'}; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">${isRecovery ? 'Monitor Recovered' : 'Monitor Down Alert'}</h2>
      </div>
      <div style="padding: 20px; background-color: #f8fafc;">
        <p style="font-size: 16px; color: #334155;"><strong>Monitor:</strong> ${safeMonitorName}</p>
        <p style="font-size: 16px; color: #334155;"><strong>URL:</strong> <a href="${safeMonitorUrl}">${safeMonitorUrl}</a></p>
        <p style="font-size: 16px; color: #334155;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        ${!isRecovery && incident ? `<p style="font-size: 16px; color: #ef4444;"><strong>Error:</strong> ${safeIncidentCause}</p>` : ''}
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
        <p>Sent securely by your WebWatch Pro Server</p>
      </div>
    </div>
  `;

  try {
    const timeoutMs = 15000; // 15 seconds
    const sendPromise = transporterInstance.sendMail({
      from: `"WebWatch Alerts" <${settings.smtpUser}>`,
      to: toAddresses,
      subject,
      html: htmlContent,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP sendMail timed out')), timeoutMs)
    );

    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`Alert email sent successfully to ${toAddresses}`);
    return true;
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return false;
  }
}
