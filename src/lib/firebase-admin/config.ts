import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    // If you have the whole JSON as a string
    const config = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(config),
    });
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    // If you prefer individual variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Fallback for local dev or GCP environments
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

/**
 * Helper function to verify a Bearer token from the request Authorization header
 * and check if the user has the "admin" role.
 */
export async function verifyAdmin(request: Request): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user has an admin role by querying Firestore via REST API using their own token.
    // This avoids needing Firebase Admin service account credentials for DB access,
    // and `cache: "no-store"` prevents Next.js from caching a stale role.
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${decodedToken.uid}`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      console.log("Failed to fetch user document via REST:", await res.text());
      return null;
    }

    const data = await res.json();
    const role = data.fields?.role?.stringValue;

    if (role !== "admin") {
      console.log("User is not an admin, role is:", role);
      return null;
    }

    return { uid: decodedToken.uid };
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return null;
  }
}
