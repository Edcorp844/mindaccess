export async function GET() {
  try {
    const license = {
      platform: "iOS",
      version: "1.0",
      content: "This is the license agreement for the iOS version of the app. [Full license text would go here.]"
    };
    return Response.json(license);
  } catch (error) {
    return Response.json({ error: "Failed to fetch iOS license" }, { status: 500 });
  }
}