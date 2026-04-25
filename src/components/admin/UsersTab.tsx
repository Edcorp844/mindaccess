"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Bell, ShieldOff } from "lucide-react";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "user" | "admin";
  provider: string;
}

export default function UsersTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingUid, setPromotingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const userList = snap.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email || "N/A",
        displayName: doc.data().displayName || "Unknown",
        role: doc.data().role || "user",
        provider: doc.data().provider || "password",
      })) as AppUser[];
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (targetUser: AppUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    
    // Safety check: Don't demote yourself
    if (targetUser.uid === user?.uid && newRole === "user") {
      alert("You cannot demote yourself! Please have another admin do this.");
      return;
    }

    if (!confirm(`Are you sure you want to change ${targetUser.displayName}'s role to ${newRole}?`)) return;
    
    setPromotingUid(targetUser.uid);
    try {
      await updateDoc(doc(db, "users", targetUser.uid), {
        role: newRole
      });
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to update role. Check your permissions.");
    } finally {
      setPromotingUid(null);
    }
  };

  return (
    <div className="animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Manage Users</h1>
      </div>

      <div className="bg-backgroundLayer1 border border-separator rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-separator text-sm text-labelSecondary">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Provider</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-labelSecondary">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-labelSecondary">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-separator/20 transition-colors">
                    <td className="p-4 font-medium">{u.displayName}</td>
                    <td className="p-4 text-labelSecondary">{u.email}</td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-medium bg-separator/50 px-2 py-1 rounded-md">
                        {u.provider.replace(".com", "")}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-systemGreen font-bold bg-systemGreen/10 px-2 py-1 rounded-full text-xs">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-labelSecondary font-medium px-2 py-1 text-xs">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          const title = prompt("Message Title:");
                          const body = prompt("Message Body:");
                          if (title && body) {
                            addDoc(collection(db, "users", u.uid, "notifications"), {
                              title,
                              body,
                              icon: "💬",
                              type: "system",
                              read: false,
                              createdAt: serverTimestamp(),
                            }).then(() => alert("Message sent!"));
                          }
                        }}
                        className="p-2 hover:bg-systemGreen/10 text-systemGreen rounded-lg transition-colors"
                        title="Quick Message"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleRole(u)}
                        disabled={promotingUid === u.uid}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 ${
                          u.role === "admin" 
                          ? "bg-systemRed/10 hover:bg-systemRed/20 text-systemRed" 
                          : "bg-systemBlue/10 hover:bg-systemBlue/20 text-systemBlue"
                        }`}
                      >
                        {u.role === "admin" ? <ShieldOff className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {promotingUid === u.uid ? "Updating..." : (u.role === "admin" ? "Demote" : "Make Admin")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
