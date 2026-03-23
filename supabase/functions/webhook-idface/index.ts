// supabase/functions/webhook-idface/index.ts
// Edge Function: receives push events from Control iD iDFace device
// and records attendance in frequencia_catraca table.
//
// Control iD Push payload shape (simplified):
// {
//   "access_logs": [
//     { "user_id": 42, "time": "2026-03-23 08:15:00", ... }
//   ]
// }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccessLogEntry {
  user_id: number;          // maps to alunos.idface_user_id
  time: string;             // ISO-ish datetime string from device
  device_ip?: string;
  [key: string]: unknown;   // extra fields from device (ignored)
}

interface IdfacePushPayload {
  access_logs?: AccessLogEntry[];
  // Some firmware sends 'logs' or nested objects — handle gracefully
  logs?: AccessLogEntry[];
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Parse body — always return 200 to prevent device retry storms
  let payload: IdfacePushPayload = {};
  try {
    const text = await req.text();
    console.log('[webhook-idface] Raw payload:', text.slice(0, 2000));
    payload = JSON.parse(text);
  } catch (err) {
    console.error('[webhook-idface] Failed to parse JSON:', err);
    // Still return 200 to prevent infinite retries from device
    return new Response(JSON.stringify({ received: true, processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Normalise: device might send access_logs or logs
  const logs: AccessLogEntry[] = payload.access_logs ?? payload.logs ?? [];

  if (logs.length === 0) {
    console.log('[webhook-idface] No access_logs in payload, nothing to process.');
    return new Response(JSON.stringify({ received: true, processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create Supabase client with service_role key (bypasses RLS)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceKey);

  // Extract device IP from request headers (Control iD sends X-Forwarded-For or similar)
  const deviceIp =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  let processed = 0;
  const errors: string[] = [];

  for (const log of logs) {
    const idfaceUserId = log.user_id;

    if (!idfaceUserId && idfaceUserId !== 0) {
      console.warn('[webhook-idface] Log entry missing user_id, skipping:', log);
      errors.push('Missing user_id in log entry');
      continue;
    }

    // Lookup aluno by idface_user_id
    const { data: aluno, error: alunoBusca } = await supabase
      .from('alunos')
      .select('id')
      .eq('idface_user_id', idfaceUserId)
      .maybeSingle();

    if (alunoBusca) {
      console.error(`[webhook-idface] DB error looking up user_id=${idfaceUserId}:`, alunoBusca.message);
      errors.push(`DB lookup error for user_id=${idfaceUserId}: ${alunoBusca.message}`);
      continue;
    }

    if (!aluno) {
      console.warn(`[webhook-idface] No aluno found for idface_user_id=${idfaceUserId}`);
      errors.push(`No aluno for idface_user_id=${idfaceUserId}`);
      continue;
    }

    // Parse timestamp from device (format: "2026-03-23 08:15:00" or ISO)
    let dataHora: string;
    try {
      // Replace space with T to make it a valid ISO string
      dataHora = new Date(log.time.replace(' ', 'T')).toISOString();
    } catch {
      console.warn(`[webhook-idface] Invalid time format: "${log.time}", using server time`);
      dataHora = new Date().toISOString();
    }

    const { error: insertError } = await supabase
      .from('frequencia_catraca')
      .insert({
        aluno_id:       aluno.id,
        data_hora:      dataHora,
        dispositivo_ip: log.device_ip ?? deviceIp,
        processado:     false,
      });

    if (insertError) {
      console.error(`[webhook-idface] Insert error for aluno ${aluno.id}:`, insertError.message);
      errors.push(`Insert error for aluno ${aluno.id}: ${insertError.message}`);
    } else {
      console.log(`[webhook-idface] ✅ Registered: aluno=${aluno.id} time=${dataHora}`);
      processed++;
    }
  }

  console.log(`[webhook-idface] Done. processed=${processed}/${logs.length} errors=${errors.length}`);

  // Always 200 — device should not retry on app-level errors
  return new Response(
    JSON.stringify({ received: true, processed, total: logs.length, errors }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
