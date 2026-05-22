import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing SUPABASE_URL or SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing auth token." }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized request." }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const { data: adminUser, error: adminError } = await admin
      .from("admin_users")
      .select("id, user_id, role, name, is_active")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) {
      return new Response(JSON.stringify({ success: false, error: adminError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!adminUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No admin profile found for this account."
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminUser
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected admin lookup error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
