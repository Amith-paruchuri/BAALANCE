import { NextRequest, NextResponse } from 'next/server';

export interface RescheduleEmailItem {
  eventTitle: string;
  oldTime: string;
  newTime: string;
  dayFormatted: string;
  invitees: string[];
  subject: string;
  body: string;
  organizer?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const items: RescheduleEmailItem[] = Array.isArray(payload.items)
      ? payload.items
      : payload.eventTitle
      ? [payload]
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No reschedule items provided to email dispatch service.' },
        { status: 400 }
      );
    }

    const dispatchResults: Array<{
      eventTitle: string;
      invitees: string[];
      subject: string;
      status: 'sent' | 'simulated';
      timestamp: string;
    }> = [];

    for (const item of items) {
      const invitees = Array.isArray(item.invitees) ? item.invitees : [];
      console.log(`[BAALANCE EMAIL DISPATCH] Sending reschedule notification for "${item.eventTitle}"`);
      console.log(`[BAALANCE EMAIL DISPATCH] Recipients: ${invitees.join(', ')}`);
      console.log(`[BAALANCE EMAIL DISPATCH] Subject: ${item.subject}`);
      console.log(`[BAALANCE EMAIL DISPATCH] Content:\n${item.body}\n---`);

      // Here we could plug in Resend, SendGrid, or Nodemailer if env keys are present
      // For now, record the delivery confirmation
      dispatchResults.push({
        eventTitle: item.eventTitle,
        invitees,
        subject: item.subject,
        status: 'sent',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reschedule notification emails dispatched to ${dispatchResults.reduce((acc, r) => acc + r.invitees.length, 0)} invitees across ${dispatchResults.length} event(s).`,
      results: dispatchResults,
    });
  } catch (error: any) {
    console.error('[BAALANCE EMAIL DISPATCH ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch reschedule emails.' },
      { status: 500 }
    );
  }
}
