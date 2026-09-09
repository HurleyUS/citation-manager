import { v } from "convex/values";
import {
  type GoogleServiceAccount,
  signGoogleServiceAccountJwt,
} from "./googleJwt";

/**
 * Google Business Profile API Integration
 * Documentation: https://developers.google.com/my-business/
 *
 * Prerequisites:
 * 1. Google Cloud Project with My Business API enabled
 * 2. Service account credentials (JSON key file)
 * 3. Grant service account access to Google Business locations
 * 4. GOOGLE_ACCESS_TOKEN env var with valid OAuth token
 */

interface GoogleBusinessLocation {
  displayName: string;
  businessType: string;
  primaryPhone: string;
  primaryWebsite?: string;
  businessProfile?: {
    description?: string;
    categories?: string[];
  };
  address: {
    postalCode?: string;
    countryCode: string;
    administrativeArea?: string;
    locality?: string;
    addressLines?: string[];
  };
}

function parseServiceAccount(): GoogleServiceAccount {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set. " +
        "See .env.example for setup instructions.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: " + String(error));
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must be a JSON object");
  }

  const account = parsed as Partial<GoogleServiceAccount>;
  if (typeof account.client_email !== "string" || typeof account.private_key !== "string") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key");
  }

  return account as GoogleServiceAccount;
}

async function exchangeGoogleJwtForAccessToken(jwt: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google token exchange returned no access_token");
  }
  return data.access_token;
}

/**
 * Prefer GOOGLE_ACCESS_TOKEN. Otherwise sign a real service-account JWT
 * and exchange it for an access token. Never invent a bearer string.
 */
const getGoogleAccessToken = async (): Promise<string> => {
  const token = process.env.GOOGLE_ACCESS_TOKEN;
  if (token) {
    return token;
  }

  const jwt = await signGoogleServiceAccountJwt(parseServiceAccount());
  return await exchangeGoogleJwtForAccessToken(jwt);
};

/**
 * Convert internal location data to Google Business Profile format
 */
export const mapLocationToGoogleFormat = (locationData: {
  businessName: string;
  address: string;
  phone: string;
  website?: string;
  city: string;
  state: string;
  zipCode: string;
}): GoogleBusinessLocation => {
  return {
    displayName: locationData.businessName,
    businessType: "LOCAL_BUSINESS",
    primaryPhone: locationData.phone,
    primaryWebsite: locationData.website,
    address: {
      addressLines: [locationData.address],
      locality: locationData.city,
      administrativeArea: locationData.state,
      postalCode: locationData.zipCode,
      countryCode: "US",
    },
  };
};

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000,
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on auth errors
      if (lastError.message.includes("401") || lastError.message.includes("403")) {
        throw lastError;
      }

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
};

/**
 * Submit location to Google Business Profile
 * Includes retry logic and rate limiting
 */
export const submitGoogleBusiness = async (
  accountId: string,
  locationData: {
    businessName: string;
    address: string;
    phone: string;
    website?: string;
    city: string;
    state: string;
    zipCode: string;
  },
): Promise<{ googleLocationId: string; success: boolean; error?: string }> => {
  try {
    const accessToken = await getGoogleAccessToken();
    const formattedData = mapLocationToGoogleFormat(locationData);

    const result = await retryWithBackoff(async () => {
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        const message = `Google Business submission failed (${response.status}): ${error}`;

        // Return structured error for user display
        if (response.status === 400) {
          throw new Error(`Invalid location data: ${error}`);
        } else if (response.status === 429) {
          throw new Error("Rate limited by Google - please try again later");
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication failed - check API credentials");
        }

        throw new Error(message);
      }

      return (await response.json()) as { name: string };
    });

    const googleLocationId = result.name.split("/").pop() || "";

    return { googleLocationId, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      googleLocationId: "",
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Verify submission via Google Business Profile API
 * Checks that the location exists and returns verification status
 */
export const verifyGoogleBusinessSubmission = async (
  accountId: string,
  googleLocationId: string,
): Promise<{
  verified: boolean;
  status?: string;
  error?: string;
}> => {
  try {
    const accessToken = await getGoogleAccessToken();

    const response = await retryWithBackoff(async () => {
      return await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${googleLocationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    });

    if (!response.ok) {
      return {
        verified: false,
        error: `Failed to fetch verification status (${response.status})`,
      };
    }

    const location = (await response.json()) as {
      name?: string;
      state?: string;
      verificationStatus?: {
        status: string;
        canReVerify?: boolean;
      };
    };

    // Verify location exists
    if (!location.name) {
      return {
        verified: false,
        error: "Location not found",
      };
    }

    const verificationStatus = location.verificationStatus?.status || "UNVERIFIED";
    const isVerified = verificationStatus === "VERIFIED";

    return {
      verified: isVerified,
      status: verificationStatus,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      verified: false,
      error: errorMessage,
    };
  }
};

/**
 * Types for Convex schema integration
 */
export const GoogleSubmissionSchema = {
  googleAccountId: v.string(),
  googleLocationId: v.optional(v.string()),
  verificationStatus: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
  lastSyncAt: v.number(),
  apiResponse: v.optional(v.object({})),
};
