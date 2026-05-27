export async function initiateMpesaStkPush(supabase, payload) {
  const invokeResult = await supabase.functions.invoke("mpesa-stk-initiate", {
    body: payload
  });

  if (!invokeResult.error && invokeResult.data) {
    return invokeResult.data;
  }

  const invokeErrorMessage = invokeResult.error?.message || "";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `${invokeErrorMessage} Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for fallback request.`
    );
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const response = await fetch(`${supabaseUrl}/functions/v1/mpesa-stk-initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: session?.access_token ? `Bearer ${session.access_token}` : ""
    },
    body: JSON.stringify(payload)
  });

  const fallbackData = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      fallbackData?.error ||
        fallbackData?.message ||
        `${invokeErrorMessage} Failed to send a request to the Edge Function`
    );
  }

  return fallbackData;
}
