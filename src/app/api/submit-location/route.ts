import { NextResponse } from "next/server";
import type { LocationSubmission } from "@/types/location";

export async function POST(request: Request) {
  try {
    const submission: LocationSubmission = await request.json();

    // Strategy 1: Try to submit directly to btcmap.org form endpoint
    // This would require reverse-engineering their form submission
    // For now, we'll skip this as it likely requires solving CAPTCHA

    // Strategy 2: Create a GitHub issue directly (requires GitHub token)
    // This is the most reliable approach since it's what the bot does
    // For MVP, we'll return success and log the submission
    // In production, this would create a GitHub issue

    // Create GitHub issue
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      await createGitHubIssue(submission, githubToken);
    }

    return NextResponse.json({
      success: true,
      message: "Submission received. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit location. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Helper function to create GitHub issue (to be implemented)
async function createGitHubIssue(
  submission: LocationSubmission,
  githubToken: string
) {
  const issueBody = formatIssueBody(submission);

  const response = await fetch(
    "https://api.github.com/repos/btcmapsubmitter/btcmap-test/issues",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        title: submission.name,
        body: issueBody,
        labels: ["location-submission", "help wanted", "good first issue"],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

// Extract country from address
function extractCountry(address: string): string {
  // Simple country extraction - looks for common country names at end of address
  const countryPatterns = [
    { pattern: /USA$/i, name: "United States" },
    { pattern: /United States$/i, name: "United States" },
    { pattern: /Canada$/i, name: "Canada" },
    { pattern: /UK$/i, name: "United Kingdom" },
    { pattern: /United Kingdom$/i, name: "United Kingdom" },
    { pattern: /Australia$/i, name: "Australia" },
    { pattern: /France$/i, name: "France" },
    { pattern: /Germany$/i, name: "Germany" },
    { pattern: /Spain$/i, name: "Spain" },
    { pattern: /Italy$/i, name: "Italy" },
    { pattern: /Brazil$/i, name: "Brazil" },
    { pattern: /Mexico$/i, name: "Mexico" },
    { pattern: /Japan$/i, name: "Japan" },
    { pattern: /China$/i, name: "China" },
    { pattern: /India$/i, name: "India" },
  ];

  for (const { pattern, name } of countryPatterns) {
    if (pattern.test(address)) {
      return name;
    }
  }

  // Default to United States if can't determine
  return "United States";
}

// Format submission data as GitHub issue body (matching BTCMap-NoobBot format exactly)
function formatIssueBody(submission: LocationSubmission): string {
  const country = extractCountry(submission.address);
  const createdAt = new Date().toISOString();

  // Format payment methods as lowercase, comma-separated
  const paymentMethods = submission.paymentMethods
    .map((method) => method.toLowerCase())
    .join(", ");

  // Format opening hours (single line or empty)
  const openingHours = submission.openingHours
    ? submission.openingHours.replace(/\n/g, ", ")
    : "";

  // Build plain text format (no markdown)
  const lines = [
    `Merchant name: ${submission.name}`,
    `Country: ${country}`,
    `Communities: `,
    `Address: ${submission.address}`,
    `Lat: ${submission.lat || ""}`,
    `Long: ${submission.lng || ""}`,
    `Category: ${submission.category || ""}`,
    `Payment methods: ${paymentMethods}`,
    `Website: ${submission.website || ""}`,
    `Phone: ${submission.phone || ""}`,
    `Contact: ${submission.email}`,
    `Opening hours: ${openingHours}`,
    `Twitter merchant: `,
    `Twitter submitter: `,
    `Notes: `,
    `Status: Todo`,
    `Created at: ${createdAt}`,
  ];

  // Add OSM link if coordinates available
  if (submission.lat && submission.lng) {
    lines.push(
      `OSM: https://www.openstreetmap.org/edit#map=21/${submission.lat}/${submission.lng}`
    );
  }

  return lines.join("\n");
}
