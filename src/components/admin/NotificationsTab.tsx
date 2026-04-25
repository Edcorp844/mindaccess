"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Globe, User, Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function NotificationsTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [icon, setIcon] = useState("📢");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [targetUid, setTargetUid] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecent = async () => {
    try {
      const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(5));
      const snap = await getDocs(q);
      setRecentNotifications(snap.docs.map(d => ({ id: d.id, ...d.data(), scope: "Global" })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setIsSending(true);

    try {
      if (target === "all") {
        await addDoc(collection(db, "notifications"), {
          title,
          body,
          icon,
          type: "general",
          createdAt: serverTimestamp(),
        });
      } else {
        if (!targetUid) throw new Error("Please provide a User UID");
        await addDoc(collection(db, "users", targetUid, "notifications"), {
          title,
          body,
          icon,
          type: "system",
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setTitle("");
      setBody("");
      alert("Notification sent successfully!");
      fetchRecent();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification? (This only removes it from the global list for new users)")) return;
    await deleteDoc(doc(db, "notifications", id));
    fetchRecent();
  };

  return (
    <div className="space-y-10 animate-slide-in">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Communications</h1>
        <p className="text-labelSecondary font-medium">Broadcast updates or message specific users.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Compose Form */}
        <div className="bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Send className="text-systemGreen" /> Compose Notification
          </h2>
          
          <form onSubmit={handleSend} className="space-y-6">
            <div className="flex bg-separator/10 p-1 rounded-2xl gap-1">
              <button 
                type="button"
                onClick={() => setTarget("all")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${target === "all" ? "bg-background shadow-md text-foreground" : "text-labelSecondary hover:bg-separator/10"}`}
              >
                <Globe size={16} /> Broadcast
              </button>
              <button 
                type="button"
                onClick={() => setTarget("specific")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${target === "specific" ? "bg-background shadow-md text-foreground" : "text-labelSecondary hover:bg-separator/10"}`}
              >
                <User size={16} /> Specific User
              </button>
            </div>

            {target === "specific" && (
              <div className="space-y-4 animate-slide-in relative">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-labelSecondary ml-1">Search User</label>
                  <div className="relative">
                    <input 
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setTargetUid(""); // Reset selection when typing
                      }}
                      onFocus={() => {}}
                      placeholder="Type name or email..."
                      className="w-full bg-background border border-separator rounded-2xl px-6 py-4 outline-none focus:border-systemGreen transition-all pr-12"
                    />
                    {userSearch && (
                      <button 
                        type="button"
                        onClick={() => { setUserSearch(""); setTargetUid(""); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-separator rounded-full transition-colors"
                      >
                        <Trash2 size={16} className="text-labelSecondary" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Collapsible Search Results */}
                {userSearch.length >= 2 && !targetUid && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-2 max-h-[250px] overflow-y-auto border border-separator rounded-3xl bg-background/95 backdrop-blur-xl shadow-2xl divide-y divide-separator animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredUsers.length === 0 ? (
                      <div className="p-6 text-center text-sm text-labelSecondary italic">
                        No users found matching "{userSearch}"
                      </div>
                    ) : (
                      <>
                        <div className="p-3 px-6 text-[10px] font-black uppercase tracking-widest text-labelSecondary bg-separator/5">
                          Suggestions ({filteredUsers.length})
                        </div>
                        {filteredUsers.slice(0, 10).map(u => (
                          <div 
                            key={u.uid} 
                            onClick={() => {
                              setTargetUid(u.uid);
                              setUserSearch(u.displayName || u.email);
                            }}
                            className="p-4 px-6 cursor-pointer hover:bg-systemGreen/10 transition-colors flex flex-col group"
                          >
                            <span className="font-bold text-sm group-hover:text-systemGreen transition-colors">{u.displayName || 'Unnamed User'}</span>
                            <span className="text-[10px] text-labelSecondary font-mono">{u.email}</span>
                          </div>
                        ))}
                        {filteredUsers.length > 10 && (
                          <div className="p-3 text-center text-[10px] text-labelSecondary italic">
                            + {filteredUsers.length - 10} more matches... Refine your search.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Selected User Badge */}
                {targetUid && (
                  <div className="flex items-center gap-3 p-4 bg-systemGreen/10 border border-systemGreen/20 rounded-2xl animate-in zoom-in-95">
                    <div className="w-10 h-10 rounded-full bg-systemGreen text-white flex items-center justify-center font-black">
                      {userSearch[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-systemGreen">Selected Recipient</p>
                      <p className="text-xs text-labelSecondary truncate">{userSearch}</p>
                    </div>
                    <button type="button" onClick={() => { setTargetUid(""); setUserSearch(""); }} className="p-2 hover:bg-systemGreen/20 text-systemGreen rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-labelSecondary ml-1">Icon / Emoji</label>
              <input 
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-20 text-center bg-background border border-separator rounded-2xl px-6 py-4 outline-none focus:border-systemGreen text-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-labelSecondary ml-1">Title</label>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Important update..."
                className="w-full bg-background border border-separator rounded-2xl px-6 py-4 outline-none focus:border-systemGreen transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-labelSecondary ml-1">Message Body</label>
              <textarea 
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your notification content here..."
                className="w-full bg-background border border-separator rounded-2xl px-6 py-4 outline-none focus:border-systemGreen transition-all min-h-[150px] resize-none"
              />
            </div>

            <button 
              disabled={isSending}
              className="w-full bg-systemGreen hover:bg-systemGreen/90 text-white font-black py-4 rounded-2xl shadow-lg shadow-systemGreen/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSending ? "Processing..." : `Send ${target === 'all' ? 'Broadcast' : 'to User'}`}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Bell className="text-systemBlue" /> Recent History
          </h2>
          
          <div className="space-y-4">
            {recentNotifications.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-separator rounded-3xl text-labelSecondary">
                No recent global notifications found.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id} className="bg-backgroundLayer1/50 border border-separator rounded-3xl p-6 flex gap-4 hover:bg-separator/10 transition-colors group">
                  <div className="text-3xl bg-background w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-separator">
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold truncate pr-4">{notif.title}</h3>
                      <button onClick={() => handleDelete(notif.id)} className="text-systemRed opacity-0 group-hover:opacity-100 p-2 hover:bg-systemRed/10 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-labelSecondary line-clamp-2 mt-1">{notif.body}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-systemBlue/10 text-systemBlue px-2 py-0.5 rounded">Global</span>
                      <span className="text-[10px] text-labelSecondary">{notif.createdAt?.toDate()?.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
