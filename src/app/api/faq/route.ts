export async function GET() {
  try {
    const faq = {
      title: "Frequently Asked Questions",
      questions: [
        {
          question: "How do I use the app?",
          answer: "Follow the on-screen instructions to get started."
        },
        {
          question: "How do I contact support?",
          answer: "Use the contact information in the Help section."
        }
      ]
    };
    return Response.json(faq);
  } catch (error) {
    return Response.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}