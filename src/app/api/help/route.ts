export async function GET() {
  try {
    const help = {
      title: "Help and Support",
      contact: {
        email: "support@example.com",
        phone: "+1-234-567-8900"
      },
      faq: "Check our FAQ section for common questions.",
      content: "This is the help and support information. [Full help text would go here.]"
    };
    return Response.json(help);
  } catch (error) {
    return Response.json({ error: "Failed to fetch help and support" }, { status: 500 });
  }
}