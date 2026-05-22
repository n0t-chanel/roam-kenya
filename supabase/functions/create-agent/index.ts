import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

type CreateAgentRequest = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

const ALLOWED_ROLES = new Set(["booking_agent", "driver"]);

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
    const serviceRoleKey =
      Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    const requesterId = userData.user.id;
    const { data: requesterRow, error: requesterRowError } = await admin
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", requesterId)
      .maybeSingle();

    if (requesterRowError) {
      return new Response(JSON.stringify({ success: false, error: requesterRowError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!requesterRow?.is_active || requesterRow.role !== "super_admin") {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body = (await req.json().catch(() => ({}))) as CreateAgentRequest;

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "").trim();
    const role = String(body?.role ?? "").trim();

    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "name, email, password, and role are required."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid role. Allowed roles: ${Array.from(ALLOWED_ROLES).join(", ")}.`
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (createError || !created?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: createError?.message || "Failed to create user."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: inserted, error: insertError } = await admin
      .from("admin_users")
      .insert({
        user_id: created.user.id,
        role,
        name,
        is_active: true
      })
      .select("id, user_id, role, name, is_active, created_at")
      .single();

    if (insertError) {
      await admin.auth.admin.deleteUser(created.user.id).catch(() => null);
      return new Response(
        JSON.stringify({
          success: false,
          error: insertError.message
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: inserted
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected create-agent error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
