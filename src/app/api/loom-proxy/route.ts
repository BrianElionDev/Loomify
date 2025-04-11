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

    console.log("Proxying request for Loom URL:", loomUrl);
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Validate the loomUrl
    if (!loomUrl || typeof loomUrl !== "string") {
      console.error("Invalid loom_url provided:", loomUrl);
      return NextResponse.json(
        { error: "Invalid or missing loom_url in request" },
        { status: 400 }
      );
    }

    try {
      // Make the request to the external API with explicit timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log(
        "Sending request to external API with body:",
        JSON.stringify({ loom_url: loomUrl })
      );

      // Using Next.js API to avoid potential issues with CORS or TLS
      console.log("Requesting from:", LOOM_API_URL);

      const response = await fetch(LOOM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 Loomify-NextJS-Proxy",
        },
        body: JSON.stringify({
          loom_url: loomUrl,
        }),
        signal: controller.signal,
        // For development - disable certificate verification if needed
        ...(process.env.NODE_ENV === "development" ? { agent: null } : {}),
      });

      clearTimeout(timeoutId);

      console.log("External API response status:", response.status);
      console.log(
        "External API response headers:",
        JSON.stringify(
          Object.fromEntries([...response.headers.entries()]),
          null,
          2
        )
      );

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
        } catch (textError) {
          console.error("Could not extract error text:", textError);
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
          "Response raw text (first 200 chars):",
          responseText.substring(0, 200)
        );

        // Now try to parse as JSON
        const data = JSON.parse(responseText);
        console.log("Successfully parsed response data");
        return NextResponse.json(data);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        return NextResponse.json(
          { error: "Failed to parse response from API" },
          { status: 500 }
        );
      }
    } catch (fetchError: unknown) {
      console.error("Fetch operation failed:", fetchError);
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
    console.error("API proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Failed to proxy request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
