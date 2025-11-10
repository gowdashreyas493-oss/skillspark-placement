import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { language, code } = await req.json();

    // Map language names to JDoodle language IDs
    const languageMap: Record<string, string> = {
      python: 'python3',
      c: 'c',
      cpp: 'cpp17',
      java: 'java',
      javascript: 'nodejs'
    };

    const jdoodleLanguage = languageMap[language] || 'python3';

    // Use JDoodle API to compile and run code
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: Deno.env.get('JDOODLE_CLIENT_ID') || 'demo-client',
        clientSecret: Deno.env.get('JDOODLE_CLIENT_SECRET') || 'demo-secret',
        script: code,
        language: jdoodleLanguage,
        versionIndex: '0'
      })
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({
        output: result.output || result.error || 'No output',
        statusCode: result.statusCode,
        memory: result.memory,
        cpuTime: result.cpuTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
