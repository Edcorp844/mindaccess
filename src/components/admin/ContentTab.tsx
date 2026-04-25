"use client";

import { useState, useEffect } from "react";
import { FileText, LifeBuoy, ShieldCheck, Save, RefreshCw, HelpCircle, Smartphone, Globe, Plus, Trash2 } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type ContentType = "terms" | "help" | "faq" | "licenses_android" | "licenses_ios" | "licenses_web";

interface Library {
  name: string;
  licenseType: string;
  url: string;
  content: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function ContentTab() {
  const [activeTab, setActiveTab] = useState<ContentType>("terms");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [markdownContent, setMarkdownContent] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faqText, setFaqText] = useState("");
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const fetchContent = async (type: ContentType) => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "AppContent", type));
      if (snap.exists()) {
        const data = snap.data();
        if (type.startsWith("licenses")) {
          setLibraries(data.libraries || []);
        } else if (type === "faq") {
          setFaqs(data.questions || []);
        } else {
          setMarkdownContent(data.content || "");
          if (type === "terms") setVersion(data.version || "1.0.0");
          if (type === "help") {
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setFaqText(data.faqText || "");
          }
        }
      } else {
        setMarkdownContent("");
        setLibraries([]);
        setFaqs([]);
        setEmail("");
        setPhone("");
        setFaqText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let data: any = { updatedAt: serverTimestamp() };
      
      if (activeTab.startsWith("licenses")) {
        data.libraries = libraries;
      } else if (activeTab === "faq") {
        data.questions = faqs;
      } else {
        data.content = markdownContent;
        if (activeTab === "terms") data.version = version;
        if (activeTab === "help") {
          data.email = email;
          data.phone = phone;
          data.faqText = faqText;
        }
      }
      
      await setDoc(doc(db, "AppContent", activeTab), data);
      alert("Content saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isLibraryType = activeTab.startsWith("licenses");
  const isFaqType = activeTab === "faq";

  return (
    <div className="space-y-10 animate-slide-in pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">App Content</h1>
        <p className="text-labelSecondary font-medium">Manage legal documents, FAQs, and platform resources.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <TabButton active={activeTab === "terms"} onClick={() => setActiveTab("terms")} icon={FileText} label="Terms & Conditions" />
          <TabButton active={activeTab === "help"} onClick={() => setActiveTab("help")} icon={LifeBuoy} label="Help & Support" />
          <TabButton active={activeTab === "faq"} onClick={() => setActiveTab("faq")} icon={HelpCircle} label="FAQs" />
          
          <div className="pt-4 pb-2 px-6 text-[10px] font-black uppercase tracking-widest text-labelSecondary">Software Licenses</div>
          <TabButton active={activeTab === "licenses_android"} onClick={() => setActiveTab("licenses_android")} icon={Smartphone} label="Android" />
          <TabButton active={activeTab === "licenses_ios"} onClick={() => setActiveTab("licenses_ios")} icon={Smartphone} label="iOS" />
          <TabButton active={activeTab === "licenses_web"} onClick={() => setActiveTab("licenses_web")} icon={Globe} label="Web" />
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 bg-backgroundLayer1/50 backdrop-blur-xl border border-separator rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black capitalize">{activeTab.replace("_", " ")}</h2>
            {activeTab === "terms" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-labelSecondary uppercase tracking-widest">Version:</span>
                <input value={version} onChange={(e) => setVersion(e.target.value)} className="bg-background border border-separator rounded-lg px-3 py-1 text-sm font-bold w-24 outline-none focus:border-systemGreen" />
              </div>
            )}
            {(isLibraryType || isFaqType) && (
              <button 
                onClick={() => {
                  if (isLibraryType) setLibraries([...libraries, { name: "", licenseType: "", url: "", content: "" }]);
                  else setFaqs([...faqs, { id: Date.now(), question: "", answer: "" }]);
                }}
                className="flex items-center gap-2 bg-systemGreen/10 text-systemGreen px-4 py-2 rounded-xl text-sm font-bold hover:bg-systemGreen/20 transition-all"
              >
                <Plus size={16} /> Add {isLibraryType ? 'Library' : 'Question'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-[400px] flex items-center justify-center"><RefreshCw className="animate-spin text-systemGreen" size={32} /></div>
          ) : (
            <div className="space-y-6">
              {/* Markdown Editor for Terms/Help */}
              {!isLibraryType && !isFaqType && (
                <div className="space-y-6">
                  {activeTab === "help" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">Support Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" placeholder="support@example.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">Support Phone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" placeholder="+1-234-567-8900" />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">FAQ Section Text</label>
                        <input value={faqText} onChange={(e) => setFaqText(e.target.value)} className="w-full bg-background border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" placeholder="Check our FAQ section for common questions." />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-labelSecondary">Main Content (Markdown)</label>
                    <textarea 
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      className="w-full bg-background border border-separator rounded-2xl px-6 py-6 outline-none focus:border-systemGreen transition-all min-h-[400px] font-mono text-sm leading-relaxed"
                      placeholder="Enter markdown content..."
                    />
                  </div>
                </div>
              )}

              {/* Structured Editor for Licenses */}
              {isLibraryType && (
                <div className="space-y-6">
                  {libraries.map((lib, idx) => (
                    <div key={idx} className="bg-background border border-separator rounded-2xl p-6 space-y-4 relative group">
                      <button onClick={() => setLibraries(libraries.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-2 text-systemRed hover:bg-systemRed/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-labelSecondary">Library Name</label>
                          <input value={lib.name} onChange={(e) => setLibraries(libraries.map((l, i) => i === idx ? {...l, name: e.target.value} : l))} className="w-full bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-labelSecondary">License Type</label>
                          <input value={lib.licenseType} onChange={(e) => setLibraries(libraries.map((l, i) => i === idx ? {...l, licenseType: e.target.value} : l))} className="w-full bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">URL</label>
                        <input value={lib.url} onChange={(e) => setLibraries(libraries.map((l, i) => i === idx ? {...l, url: e.target.value} : l))} className="w-full bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">Copyright Content</label>
                        <textarea value={lib.content} onChange={(e) => setLibraries(libraries.map((l, i) => i === idx ? {...l, content: e.target.value} : l))} className="w-full bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen min-h-[80px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structured Editor for FAQ */}
              {isFaqType && (
                <div className="space-y-6">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-background border border-separator rounded-2xl p-6 space-y-4 relative group">
                      <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-2 text-systemRed hover:bg-systemRed/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">Question</label>
                        <input value={faq.question} onChange={(e) => setFaqs(faqs.map((f, i) => i === idx ? {...f, question: e.target.value} : f))} className="w-full font-bold bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-labelSecondary">Answer</label>
                        <textarea value={faq.answer} onChange={(e) => setFaqs(faqs.map((f, i) => i === idx ? {...f, answer: e.target.value} : f))} className="w-full bg-backgroundLayer1 border border-separator rounded-xl px-4 py-2 text-sm outline-none focus:border-systemGreen min-h-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-systemGreen hover:bg-systemGreen/90 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-systemGreen/20 transition-all active:scale-95 disabled:opacity-50">
                  <Save size={20} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-systemGreen text-white shadow-lg shadow-systemGreen/20' : 'text-labelSecondary hover:bg-separator/10'}`}>
      <Icon size={20} /> <span>{label}</span>
    </button>
  );
}
