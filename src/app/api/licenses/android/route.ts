export async function GET() {
  try {
    const license = {
      platform: "Android",
      version: "1.0",
      content: "This is the license agreement for the Android version of the app. [Full license text would go here.]"
    };
    return Response.json(license);
  } catch (error) {
    return Response.json({ error: "Failed to fetch Android license" }, { status: 500 });
  }
}