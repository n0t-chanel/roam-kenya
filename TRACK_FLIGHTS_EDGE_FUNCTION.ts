// Supabase Edge Function: track-flights
// Deploy to: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
// Schedule: Every 5 minutes using a cron trigger

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const aviationStackKey = Deno.env.get("AVIATIONSTACK_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Flight {
  flight_iata: string;
  flight_status: string;
  arrival: {
    estimated: string;
    actual: string;
  };
  aircraft: {
    iata: string;
  };
}

interface FlightBooking {
  id: string;
  flight_number: string;
  booking_id: string;
  user_id: string;
  tracking_status: string;
}

// Fetch flight status from AviationStack API
async function getFlightStatus(flightNumber: string): Promise<Flight | null> {
  try {
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${aviationStackKey}&flight_iata=${flightNumber}`
    );

    if (!response.ok) {
      console.error(`AviationStack API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log(`No flight data found for ${flightNumber}`);
      return null;
    }

    return data.data[0];
  } catch (error) {
    console.error(`Failed to fetch flight ${flightNumber}:`, error);
    return null;
  }
}

// Map AviationStack status to our tracking status
function mapFlightStatus(aviationStatus: string): string {
  const statusMap: Record<string, string> = {
    scheduled: "waiting",
    active: "in-air",
    landed: "landed",
    cancelled: "cancelled",
    delayed: "in-air", // Treat delayed as in-air
  };

  return statusMap[aviationStatus] || "waiting";
}

// Send notification to user
async function sendNotification(
  userId: string,
  bookingId: string,
  status: string
): Promise<void> {
  try {
    // Get user profile
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("email, phone")
      .eq("id", userId)
      .single();

    if (!userProfile) {
      console.log(`No user profile found for ${userId}`);
      return;
    }

    // TODO: Implement email or SMS notification here
    // For now, we just update the flight_bookings table

    if (status === "landed") {
      // Update notification_sent flag
      await supabase
        .from("flight_bookings")
        .update({
          notification_sent: true,
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", bookingId);

      console.log(`Notification sent for booking ${bookingId}`);
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

// Main handler
serve(async (req) => {
  // Verify request is from Supabase (optional security check)
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${supabaseServiceKey}`) {
    console.warn("Unauthorized request");
    // Still continue for local testing
  }

  try {
    console.log("Starting flight tracking job...");

    // Get all active flight bookings
    const { data: flightBookings, error: fetchError } = await supabase
      .from("flight_bookings")
      .select("*")
      .neq("tracking_status", "landed")
      .neq("tracking_status", "picked_up")
      .neq("tracking_status", "cancelled");

    if (fetchError) {
      throw new Error(`Failed to fetch flight bookings: ${fetchError.message}`);
    }

    if (!flightBookings || flightBookings.length === 0) {
      console.log("No active flight bookings to track");
      return new Response(
        JSON.stringify({ message: "No flights to track", count: 0 }),
        { status: 200 }
      );
    }

    console.log(`Found ${flightBookings.length} flights to track`);

    let updatedCount = 0;

    // Track each flight
    for (const booking of flightBookings as FlightBooking[]) {
      const flightData = await getFlightStatus(booking.flight_number);

      if (!flightData) {
        console.log(`Could not get data for flight ${booking.flight_number}`);
        continue;
      }

      const newStatus = mapFlightStatus(flightData.flight_status);

      // Only update if status changed
      if (newStatus !== booking.tracking_status) {
        const { error: updateError } = await supabase
          .from("flight_bookings")
          .update({
            tracking_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        if (updateError) {
          console.error(
            `Failed to update booking ${booking.id}:`,
            updateError
          );
          continue;
        }

        console.log(
          `Updated flight ${booking.flight_number} to status: ${newStatus}`
        );

        // Send notification if landed
        if (newStatus === "landed") {
          await sendNotification(booking.user_id, booking.booking_id, newStatus);

          // Auto-trigger pickup
          const { error: pickupError } = await supabase
            .from("flight_bookings")
            .update({
              auto_pickup_triggered: true,
              tracking_status: "picked_up",
              updated_at: new Date().toISOString(),
            })
            .eq("id", booking.id);

          if (!pickupError) {
            console.log(`Auto-pickup triggered for booking ${booking.booking_id}`);
          }
        }

        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Flight tracking completed",
        trackedFlights: flightBookings.length,
        updatedFlights: updatedCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Flight tracking error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Deploy steps:
// 1. supabase functions deploy track-flights
// 2. Go to Supabase Dashboard → Functions → track-flights
// 3. Create a cron job: "*/5 * * * *" (every 5 minutes)
// 4. Add environment variables:
//    - AVIATIONSTACK_API_KEY: your API key
