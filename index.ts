import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />


console.log("Hello from Functions!")

const session = new Supabase.ai.Session('gte-small');
Deno.serve(async (req) => {

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )



  // Extract input string from JSON body
  const payload: WebhookPayload = await req.json();
  const {content,feedID} = payload.record;
  

  // Generate the embedding from the user input
  const embedding = await session.run(content, {
    mean_pool: true,
    normalize: true,
  });

  try {
    const { data, error } = await supabaseClient
      .from('posts')
      .update({ 'embedding': embedding })
      .eq('feedID', feedID);
  
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (e) {
    console.error('Error:', e);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Return the embedding
  return new Response(
    JSON.stringify({ embedding }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
