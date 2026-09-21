import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const isConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10
  );

  return NextResponse.json({
    configured: isConfigured,
    model: 'gemini-2.5-flash',
  });
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Google Gemini API key.' },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();

    // Verify key with Gemini 2.5 Flash
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const testRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say OK',
      });

      if (!testRes.text) {
        throw new Error('No response returned from Gemini API.');
      }
    } catch (testErr: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Verification failed: ${testErr.message || 'Invalid API key or model unreachable'}`,
        },
        { status: 400 }
      );
    }

    // Update .env.local file to persist key across server restarts
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(
          /GEMINI_API_KEY=.*/g,
          `GEMINI_API_KEY=${cleanKey}`
        );
      } else {
        envContent += `\n# Google Gemini API Key for Tricha AI\nGEMINI_API_KEY=${cleanKey}\n`;
      }

      fs.writeFileSync(envPath, envContent, 'utf8');
      process.env.GEMINI_API_KEY = cleanKey;
    } catch (fileErr) {
      console.warn('Could not write to .env.local:', fileErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini 2.5 Flash API Key connected and verified successfully!',
      model: 'gemini-2.5-flash',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save Gemini API key' },
      { status: 500 }
    );
  }
}
