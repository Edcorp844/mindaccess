export async function GET() {
  try {
    const licenses = {
      platform: "iOS",
      lastUpdated: "2026-04-19",
      libraries: [
        {
          name: "Mapbox Maps SDK for iOS",
          licenseType: "Custom (Mapbox Terms)",
          url: "https://www.mapbox.com/legal/tos/",
          content: "Copyright (c) 2026 Mapbox. Use of this SDK is subject to the Mapbox Terms of Service."
        },
        {
          name: "Mapbox Navigation SDK",
          licenseType: "ISC",
          url: "https://github.com/mapbox/mapbox-navigation-ios/blob/main/LICENSE.md",
          content: "Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies."
        },
        {
          name: "SwiftUI",
          licenseType: "Apple Standard",
          url: "https://www.apple.com/legal/sla/",
          content: "Copyright (c) 2026 Apple Inc. All rights reserved."
        },
        {
          name: "Combine",
          licenseType: "Apple Standard",
          url: "https://developer.apple.com/support/terms/apple-id/",
          content: "Copyright (c) 2026 Apple Inc. All rights reserved."
        }
      ]
    };
    return Response.json(licenses);
  } catch (error) {
    return Response.json({ error: "Failed to fetch software licenses" }, { status: 500 });
  }
}