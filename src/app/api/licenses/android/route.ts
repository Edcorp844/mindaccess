export async function GET() {
  try {
    const licenses = {
      platform: "Android",      lastUpdated: "2026-04-19",
      libraries: [
        {
          name: "Mapbox Maps SDK for Android",
          licenseType: "Custom (Mapbox Terms)",
          url: "https://www.mapbox.com/legal/tos/",
          content: "Copyright (c) 2026 Mapbox. Use of this SDK is subject to the Mapbox Terms of Service."
        },
        {
          name: "Mapbox Navigation SDK for Android",
          licenseType: "Custom",
          url: "https://www.mapbox.com/legal/tos/",
          content: "Usage of the Mapbox Navigation SDK is governed by the Mapbox Terms of Service."
        },
        {
          name: "Jetpack Compose",
          licenseType: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.txt",
          content: "Copyright (c) 2026 The Android Open Source Project. Licensed under the Apache License, Version 2.0."
        },
        {
          name: "Material Components for Android (M3)",
          licenseType: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.txt",
          content: "Copyright (c) 2026 Google LLC. Licensed under the Apache License, Version 2.0."
        },
        {
          name: "Hilt Dependency Injection",
          licenseType: "Apache 2.0",
          url: "https://github.com/google/dagger/blob/master/LICENSE.txt",
          content: "Copyright (c) 2026 Google LLC. Licensed under the Apache License, Version 2.0."
        },
        {
          name: "Retrofit",
          licenseType: "Apache 2.0",
          url: "https://github.com/square/retrofit/blob/master/LICENSE.txt",
          content: "Copyright (c) 2026 Square, Inc. Licensed under the Apache License, Version 2.0."
        },
        {
          name: "Google Play Services Location",
          licenseType: "Google APIs Terms",
          url: "https://developers.google.com/terms/",
          content: "Subject to the Google APIs Terms of Service."
        }
      ]
    };
    return Response.json(licenses);
  } catch (error) {
    return Response.json({ error: "Failed to fetch software licenses" }, { status: 500 });
  }
}