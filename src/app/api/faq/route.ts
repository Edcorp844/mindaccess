export async function GET() {
  try {
    const faq = {
      title: "Frequently Asked Questions",
      lastUpdated: "2026-04-18",
      questions: [
        {
          id: 1,
          question: "How do I find a mental health center near me?",
          answer: "When you open the Home screen, the map will automatically center on your current location. Mental health centers are marked with pins. You can tap any pin to see the center's name, services, and contact details."
        },
        {
          id: 2,
          question: "How do I get directions to a center?",
          answer: "Tap on a center's pin to open the info banner. Click the 'Start Navigation' button, and the app will provide turn-by-turn voice and visual directions using Mapbox Navigation."
        },
        {
          id: 3,
          question: "Is my location data private?",
          answer: "Yes. We only use your location data to show you nearby centers and provide directions. We do not store your movement history on our servers."
        },
        {
          id: 4,
          question: "What should I do if a center's information is incorrect?",
          answer: "Center details are updated periodically. If you find a discrepancy in opening hours or services, please contact us via the 'Support' link so we can verify and update the directory."
        },
        {
          id: 5,
          question: "What if I am in an immediate crisis?",
          answer: "This app is for informational and navigation purposes only. If you are in immediate danger or need urgent help, please dial 999 (in Uganda) or your local emergency number immediately."
        }
      ]
    };
    return Response.json(faq);
  } catch (error) {
    return Response.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}