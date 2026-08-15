import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

const defaultPrivacy = {
  title: "Privacy Policy",
  version: "1.2.0",
  lastUpdated: "2026-04-25",
  content: `### 1. Introduction & Scope
MindAccess ("we", "our", or "us") operates the MindAccess mental health and rehabilitation directory website and mobile application in Uganda. We are committed to protecting your personal data and respecting your privacy in accordance with global data protection standards and the Google Play Developer Distribution Agreement.

This Privacy Policy explains what information we collect, how it is processed, with whom it may be shared, and your rights regarding your personal data.

---

### 2. Information We Collect
We collect only the minimum amount of data necessary to provide our directory, geolocation mapping, and care connection services:

#### A. Account Information
When you create an account or sign in using Google Sign-In or email/password:
- **Name & Display Name**
- **Email Address**
- **Profile Picture URL** (if signing in with Google)
- **Account Identifier (Firebase UID)**

#### B. Location Information (Precise & Coarse)
- When you click the **"Locate Me"** or **Geolocate** button on the directory map, the application requests access to your device's GPS coordinates.
- **How it is used:** Your location is processed solely in real-time to identify and display mental health centers, rehabilitation clinics, and emergency facilities within a 70km radius and to render navigation routes.
- **No Background Tracking:** MindAccess does **not** track your location in the background when the app is closed.
- **No Location Selling:** We **never** sell, rent, or monetize your location data.

#### C. Communication & Center Submissions
- When you submit a new center profile, edit facility details, or contact our support team, we collect the details you provide (facility name, contact numbers, working hours, and notes).

#### D. Device & Technical Diagnostics
- Standard technical metadata such as browser type, operating system version, and anonymous crash diagnostics may be logged by hosting infrastructure for stability and security.

---

### 3. How We Use Your Information
We use the collected information for the following specific purposes:
1. **Service Delivery:** To display verified mental health centers, telephone contacts, operating hours, and route directions.
2. **Account Management:** To maintain your user session, enable bookmarks, and manage role-based permissions (for administrators).
3. **Emergency Care Routing:** To help you connect with national toll-free mental health hotlines quickly.
4. **Platform Security:** To prevent unauthorized access, spam, and fraudulent facility submissions.

---

### 4. Third-Party Services & Data Processors
MindAccess integrates trusted third-party service providers that process data on our behalf under strict confidentiality agreements:
- **Google Firebase (Google LLC):** Used for user authentication (Firebase Auth), database management (Cloud Firestore), and image hosting (Cloud Storage). [Google Privacy Policy](https://policies.google.com/privacy).
- **Mapbox Inc.:** Used for vector map rendering, interactive tiles, reverse geocoding, and routing. [Mapbox Privacy Policy](https://www.mapbox.com/legal/privacy).

We do not sell, rent, or share personal information with third-party advertisers.

---

### 5. Data Retention & Security
- We implement industry-standard encryption (HTTPS/TLS in transit and AES-256 at rest) to safeguard your data.
- Account data is retained as long as your account remains active.
- If you choose to delete your account, all associated personal information is permanently removed from our active databases.

---

### 6. User Rights & Account Deletion (Google Play Data Safety)
Under applicable privacy laws and Google Play policies, you have the right to:
- **Access & Review:** Request a copy of the personal information we hold about you.
- **Rectification:** Request corrections to any inaccurate data.
- **Account & Data Deletion:** You can delete your account and all associated personal data at any time:
  - **In-App:** Visit the Account tab and select **"Delete Account"**.
  - **Web Deletion Portal:** Visit [**https://mindaccess.org/delete-account**](/delete-account) to perform immediate self-service deletion or submit an account deletion request if you have uninstalled the application.

When an account is deleted, your authentication record, user profile in Firestore, saved bookmarks, and notification records are permanently erased within 48 hours.

---

### 7. Children's Privacy
MindAccess is designed for general audiences seeking healthcare information. We do not knowingly collect personal data from children under the age of 13. If you believe a minor has provided us with personal data, please contact us for immediate removal.

---

### 8. Changes to This Privacy Policy
We may update this policy periodically to reflect service updates or regulatory requirements. Any modifications will be posted on this page with an updated "Last updated" date.

---

### 9. Contact Us
For any questions, concerns, or data protection inquiries, please contact our Data Protection Team:
- **Email:** [privacy@mindaccess.org](mailto:privacy@mindaccess.org)
- **Support:** [support@mindaccess.org](mailto:support@mindaccess.org)
- **Emergency Helpline:** +256 800 100 066
- **Address:** MindAccess Initiative, Kampala, Uganda
`
};

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "AppContent", "privacy"));
    if (snap.exists()) {
      const data = snap.data();
      return Response.json({
        title: data.title || defaultPrivacy.title,
        version: data.version || defaultPrivacy.version,
        lastUpdated:
          data.updatedAt?.toDate()?.toISOString()?.split("T")[0] ||
          defaultPrivacy.lastUpdated,
        content: data.content || defaultPrivacy.content,
      });
    }
  } catch (error) {
    console.warn("Privacy Firestore fetch fallback:", error);
  }

  return Response.json(defaultPrivacy);
}
