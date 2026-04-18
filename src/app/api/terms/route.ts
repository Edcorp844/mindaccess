export async function GET() {
  try {
    const terms = {
      title: "Terms and Conditions",
      version: "1.1.0",
      lastUpdated: "2026-04-18",
      content: `
# Terms and Conditions

Welcome to **Mind Access**. By using this application, you agree to the following terms:

### 1. No Medical Advice
**Mind Access is an information and navigation tool only.** We do not provide medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a mental health condition.

### 2. Emergency Situations
**DO NOT USE THIS APP IN AN EMERGENCY.** If you are experiencing a life-threatening emergency or are in immediate danger of harming yourself or others, please call your local emergency services (e.g., 999 or 112) or go to the nearest emergency room immediately.

### 3. Accuracy of Information
While we strive to keep the directory of mental health centers accurate and up-to-date, we cannot guarantee that the center details, opening hours, or available services are always correct. We are not responsible for any changes made by the facilities.

### 4. Navigation and Location Services
Our app uses Mapbox for navigation. Please use caution while following directions. Do not operate your mobile device while driving. Mind Access is not liable for any traffic violations or accidents resulting from the use of navigation features.

### 5. Privacy & Data
We use your location to find centers near you. Your real-time location data is processed according to our Privacy Policy and is used solely to facilitate the features of this application.

### 6. Limitation of Liability
To the maximum extent permitted by law, Mind Access and its developers shall not be liable for any direct, indirect, or incidental damages resulting from your use of the app or your reliance on the information provided herein.
      `
    };
    return Response.json(terms);
  } catch (error) {
    return Response.json({ error: "Failed to fetch terms and conditions" }, { status: 500 });
  }
}