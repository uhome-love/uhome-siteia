import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
Deno.serve(req => req.method === 'OPTIONS' ? new Response('ok',{headers:corsHeaders}) : new Response(JSON.stringify({ok:false,error:'Use the visitor-capability contact pipeline'}),{status:410,headers:{...corsHeaders,'Content-Type':'application/json'}}));
