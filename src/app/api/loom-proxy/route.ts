import { NextRequest, NextResponse } from "next/server";

// You may need to install node-fetch if this doesn't work
// This is safe for development environments only
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Get the API URL from environment variables or use a default
const LOOM_API_URL =
  process.env.NEXT_PUBLIC_LOOM_API_URL ||
  "https://loom-intergration-production.up.railway.app/api/scrape/loom";

export async function POST(req: NextRequest) {
  try {
    // Get the Loom URL from the request body
    const body = await req.json();
    const loomUrl = body.loom_url;
    const recordingType = body.recording_type || "meeting"; // Default to meeting if not provided

    console.log(`Processing: ${recordingType} Loom URL`);

    // Validate the loomUrl
    if (!loomUrl || typeof loomUrl !== "string") {
      console.error("Error: Invalid loom_url provided");
      return NextResponse.json(
        { error: "Invalid or missing loom_url in request" },
        { status: 400 }
      );
    }

    try {
      // Make the request to the external API with explicit timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Prepare request payload - ensure we're sending the exact recording_type received
      const requestPayload = {
        loom_url: loomUrl,
        recording_type: recordingType, // Pass the exact format received from frontend
      };

      // Using Next.js API to avoid potential issues with CORS or TLS
      console.log("Sending request to external API");

      const response = await fetch(LOOM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 Loomify-NextJS-Proxy",
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        // For development - disable certificate verification if needed
        ...(process.env.NODE_ENV === "development" ? { agent: null } : {}),
      });

      clearTimeout(timeoutId);

      // Simplified logging for successful responses
      console.log("External API response status:", response.status);

      // Check if the response is ok
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          console.error(
            "API proxy error response:",
            response.status,
            errorText
          );
        } catch (error) {
          console.error(
            "Could not extract error text:",
            error instanceof Error ? error.message : "Unknown error"
          );
          errorText = "Could not extract error details";
        }

        return NextResponse.json(
          { error: `Error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      // Try to read the response as text first to see what we're dealing with
      try {
        const responseText = await response.clone().text();
        console.log(
          "Response message:",
          responseText.substring(0, 100).trim() +
            (responseText.length > 100 ? "..." : "")
        );

        // Check if the response is a non-JSON "background processing" message
        if (
          responseText.includes("background and will get back to you") ||
          responseText.includes("process your request in the background")
        ) {
          console.log("Status: Background processing");
          return NextResponse.json({
            status: "processing",
            message:
              "Your Loom video is being processed in the background. Check back soon for results.",
          });
        }

        // Now try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          console.log("Status: JSON data received");
          return NextResponse.json(data);
        } catch (error) {
          console.log(
            "Status: Non-JSON response received",
            error instanceof Error ? error.message : "Unknown error"
          );
          // If we can't parse as JSON but have a text response, return it as a message
          return NextResponse.json({
            status: "success",
            message: responseText.trim(),
          });
        }
      } catch (error) {
        console.error(
          "Error: Failed to read response text",
          error instanceof Error ? error.message : "Unknown error"
        );
        return NextResponse.json(
          { error: "Failed to read response from API" },
          { status: 500 }
        );
      }
    } catch (fetchError: unknown) {
      console.error(
        "Error: Fetch operation failed",
        fetchError instanceof Error ? fetchError.message : "Unknown error"
      );

      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Unknown fetch error";

      return NextResponse.json(
        { error: `Fetch operation failed: ${errorMessage}` },
        { status: 502 }
      );
    }
  } catch (error: unknown) {
    console.error(
      "Error: API proxy error",
      error instanceof Error ? error.message : "Unknown error"
    );

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Failed to proxy request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
