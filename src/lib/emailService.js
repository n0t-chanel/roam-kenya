import { supabase } from "./supabase";

export const sendBookingEmail = async (emailData) => {
  try {
    console.log("📧 Sending booking email via Resend...", emailData);

    // Call Supabase edge function
    const { data, error } = await supabase.functions.invoke("send-booking-email", {
      body: emailData,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);
      throw error;
    }

    console.log("✅ Email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Error sending booking email:", err);
    return { success: false, error: err };
  }
};
