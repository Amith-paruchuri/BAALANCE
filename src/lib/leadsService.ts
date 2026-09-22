import fs from 'fs';
import path from 'path';
import { getISTDateInfo } from './istTime';
import { getSupabaseClient, hasValidSupabaseCredentials } from './supabase';

const LEADS_JSON_FILE = path.join(process.cwd(), 'baalance_leads.json');
const LEADS_CSV_FILE = path.join(process.cwd(), 'baalance_leads.csv');
const USER_STORE_FILE = path.join(process.cwd(), 'baalance_user_store.json');

export interface LeadRecord {
  id: string;
  email: string;
  name: string;
  source: string;
  device?: string;
  role?: string;
  sector?: string;
  timestampIST: string;
  rawTimestamp: string;
}

export interface ConsolidatedLeadItem {
  email: string;
  name: string;
  source: string;
  deviceOrRole: string;
  sector?: string;
  submittedAtIST: string;
  status: string;
}

// Load leads from JSON store
export function loadLeadsFromFile(): LeadRecord[] {
  try {
    if (fs.existsSync(LEADS_JSON_FILE)) {
      const data = fs.readFileSync(LEADS_JSON_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[BAALANCE Leads] Read warning:', e);
  }
  return [];
}

// Save leads to both JSON and Excel-compatible CSV
export function saveLeadsToFile(leads: LeadRecord[]) {
  try {
    fs.writeFileSync(LEADS_JSON_FILE, JSON.stringify(leads, null, 2), 'utf-8');

    const headers = ['Email', 'Full Name', 'Source', 'Device / Preference', 'Role / Sector', 'Submitted At (IST)', 'Status'];
    const rows = leads.map(l => {
      const escape = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
      const roleSector = l.role ? (l.sector ? `${l.role} (${l.sector})` : l.role) : (l.sector || 'General');
      let displayTime = l.timestampIST;
      if (displayTime && (displayTime.includes('T') || !displayTime.includes('IST'))) {
        try {
          const ist = getISTDateInfo(l.rawTimestamp || l.timestampIST);
          displayTime = `${ist.year}-${String(ist.monthNum).padStart(2, '0')}-${String(ist.date).padStart(2, '0')} ${ist.time12h} IST`;
        } catch (_) {}
      }
      return [
        escape(l.email),
        escape(l.name || 'Anonymous'),
        escape(l.source),
        escape(l.device || 'None specified'),
        escape(roleSector),
        escape(displayTime),
        escape('Confirmed'),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(LEADS_CSV_FILE, csvContent, 'utf-8');
  } catch (e) {
    console.warn('[BAALANCE Leads] Write warning:', e);
  }
}

// Consolidate both user store accounts and waitlist leads for Excel export
export function getAllConsolidatedLeads(): ConsolidatedLeadItem[] {
  const map = new Map<string, ConsolidatedLeadItem>();

  // 1. Ingest registered accounts from baalance_user_store.json
  try {
    if (fs.existsSync(USER_STORE_FILE)) {
      const data = fs.readFileSync(USER_STORE_FILE, 'utf-8');
      const store = JSON.parse(data);
      for (const [emailKey, entry] of Object.entries<any>(store)) {
        const cleanEmail = emailKey.toLowerCase().trim();
        if (!cleanEmail || !cleanEmail.includes('@')) continue;

        const profile = entry?.profile || {};
        const updatedAt = entry?.updatedAt || new Date().toISOString();
        const ist = getISTDateInfo(updatedAt);
        const timestampIST = `${ist.year}-${String(ist.monthNum).padStart(2, '0')}-${String(ist.date).padStart(2, '0')} ${ist.time12h} IST`;

        map.set(cleanEmail, {
          email: cleanEmail,
          name: profile.name || cleanEmail.split('@')[0],
          source: profile.isDemo ? 'Clinical Demo User' : 'Full Account Sign-Up & Intake',
          deviceOrRole: profile.role || 'User',
          sector: profile.sector || 'General',
          submittedAtIST: timestampIST,
          status: 'Active Account',
        });
      }
    }
  } catch (e) {
    console.warn('[Export Leads] Error reading user store:', e);
  }

  // 2. Ingest leads from baalance_leads.json (Wearable waitlist submissions)
  try {
    if (fs.existsSync(LEADS_JSON_FILE)) {
      const data = fs.readFileSync(LEADS_JSON_FILE, 'utf-8');
      const waitlist = JSON.parse(data);
      if (Array.isArray(waitlist)) {
        for (const w of waitlist) {
          const cleanEmail = (w.email || '').toLowerCase().trim();
          if (!cleanEmail || !cleanEmail.includes('@')) continue;

          const existing = map.get(cleanEmail);
          let formattedTime = w.timestampIST || 'Recent';
          if (formattedTime.includes('T') || !formattedTime.includes('IST')) {
            try {
              const ist = getISTDateInfo(w.rawTimestamp || w.timestampIST || new Date());
              formattedTime = `${ist.year}-${String(ist.monthNum).padStart(2, '0')}-${String(ist.date).padStart(2, '0')} ${ist.time12h} IST`;
            } catch (_) {}
          }

          map.set(cleanEmail, {
            email: cleanEmail,
            name: w.name || existing?.name || cleanEmail.split('@')[0],
            source: existing ? `${existing.source} + Wearable Waitlist` : (w.source || 'Wearable OAuth Beta Waitlist'),
            deviceOrRole: w.device || existing?.deviceOrRole || 'Apple Watch',
            sector: w.sector || existing?.sector || 'General',
            submittedAtIST: formattedTime,
            status: 'Waitlist Priority',
          });
        }
      }
    }
  } catch (e) {
    console.warn('[Export Leads] Error reading waitlist leads:', e);
  }

  return Array.from(map.values());
}
