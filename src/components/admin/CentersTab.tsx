"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { Center } from "@/utils/center";
import { useAuth } from "@/context/auth-context";

type FormState = {
  firestoreId?: string;
  id?: number;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
  open: string;
  services: string[];
  phones: string[];
  emails: { type: string; email: string }[];
  otherContacts: { type: string; value: string }[];
};

const categoryOptions = [
  { value: "Rehabilitation", label: "Rehabilitation" },
  { value: "Hospital", label: "Hospital" },
  { value: "Counselling", label: "Counselling" },
  { value: "Toll Free", label: "Toll Free" },
  { value: "Safe Space", label: "Safe Space" },
  { value: "Other Center", label: "Other Center" },
];

const initialFormState: FormState = {
  name: "",
  category: "Rehabilitation",
  latitude: "0",
  longitude: "0",
  description: "",
  open: "",
  services: [""],
  phones: [""],
  emails: [{ type: "customer service", email: "" }],
  otherContacts: [{ type: "", value: "" }],
};

export default function CentersTab() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCenters = () => {
    fetch("/api/centers")
      .then((res) => res.json())
      .then((data) => {
        setCenters(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading centers", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const handleEdit = (center: Center) => {
    setIsEditing(true);
    setForm({
      id: center.id,
      firestoreId: center.firestoreId,
      name: center.name,
      category: center.category.label,
      latitude: center.cordinates.latitude.toString(),
      longitude: center.cordinates.longitude.toString(),
      description: center.description || "",
      open: center.open || "",
      services: center.services.length ? center.services : [""],
      phones: center.contact?.phone?.length ? center.contact.phone : [""],
      emails: center.contact?.email?.length ? center.contact.email : [{ type: "customer service", email: "" }],
      otherContacts: center.contact?.other?.length ? center.contact.other : [{ type: "", value: "" }],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (center: Center) => {
    if (!confirm(`Are you sure you want to delete ${center.name}?`)) return;
    
    try {
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/centers?firestoreId=${center.firestoreId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      loadCenters();
    } catch (err) {
      console.error(err);
      alert("Error deleting center");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : "";
      const response = await fetch("/api/centers", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firestoreId: isEditing ? form.firestoreId : undefined,
          name: form.name,
          category: form.category,
          latitude: parseFloat(form.latitude) || 0,
          longitude: parseFloat(form.longitude) || 0,
          description: form.description,
          open: form.open,
          services: form.services.filter(Boolean),
          contact: {
            phone: form.phones.filter(Boolean),
            email: form.emails.filter(e => e.email),
            other: form.otherContacts.filter(o => o.value)
          }
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to save");
      }

      setIsModalOpen(false);
      setForm(initialFormState);
      setIsEditing(false);
      loadCenters();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Manage Centers</h1>
        <button 
          onClick={() => { setForm(initialFormState); setIsEditing(false); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-systemGreen hover:bg-systemGreen/90 text-white rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Center
        </button>
      </div>

      <div className="bg-backgroundLayer1 border border-separator rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-separator text-sm text-labelSecondary">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/10 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-labelSecondary">Loading...</td></tr>
              ) : centers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-labelSecondary">No centers found.</td></tr>
              ) : (
                centers.map((center, idx) => (
                  <tr key={center.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-separator/5'} hover:bg-separator/10 transition-colors`}>
                    <td className="p-4 font-bold">{center.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border" style={{ color: `var(--${center.category.color})`, borderColor: `var(--${center.category.color})40`, backgroundColor: `var(--${center.category.color})10` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--${center.category.color})` }}></span>
                        {center.category.label}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-labelSecondary font-mono">
                      {center.cordinates.latitude.toFixed(4)}, {center.cordinates.longitude.toFixed(4)}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(center)} className="p-2 hover:bg-systemBlue/10 text-systemBlue rounded-xl transition-all hover:scale-110 active:scale-95">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(center)} className="p-2 hover:bg-systemRed/10 text-systemRed rounded-xl transition-all hover:scale-110 active:scale-95">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-backgroundLayer1 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-separator shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-separator sticky top-0 bg-backgroundLayer1/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold">{isEditing ? "Edit Center" : "Add New Center"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-separator rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <div className="p-4 bg-systemRed/10 text-systemRed rounded-xl text-sm font-medium">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-labelSecondary">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors" placeholder="Center Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-labelSecondary">Category</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors">
                    {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-labelSecondary">Latitude</label>
                  <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-labelSecondary">Longitude</label>
                  <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-labelSecondary">Opening Hours</label>
                  <input required value={form.open} onChange={(e) => setForm({ ...form, open: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors" placeholder="e.g. Mon-Fri 8am-5pm" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-labelSecondary">Services</label>
                  <button type="button" onClick={() => setForm({...form, services: [...form.services, ""]})} className="text-xs font-bold text-systemGreen hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Service
                  </button>
                </div>
                {form.services.map((service, idx) => (
                  <div key={`service-${idx}`} className="flex gap-2">
                    <input value={service} onChange={(e) => {
                      const newServices = [...form.services];
                      newServices[idx] = e.target.value;
                      setForm({...form, services: newServices});
                    }} className="flex-1 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="e.g. Therapy" />
                    <button type="button" onClick={() => setForm({...form, services: form.services.filter((_, i) => i !== idx)})} className="p-2 text-systemRed hover:bg-systemRed/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-labelSecondary">Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-background border border-separator rounded-xl px-4 py-3 outline-none focus:border-systemGreen transition-colors min-h-[100px]" placeholder="Brief description..." />
              </div>

              {/* Contact Information Section */}
              <div className="border-t border-separator pt-6 space-y-6">
                <h3 className="text-lg font-bold">Contact Information</h3>
                
                {/* Phone Numbers */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-labelSecondary">Phone Numbers</label>
                    <button type="button" onClick={() => setForm({...form, phones: [...form.phones, ""]})} className="text-xs font-bold text-systemGreen hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Phone
                    </button>
                  </div>
                  {form.phones.map((phone, idx) => (
                    <div key={`phone-${idx}`} className="flex gap-2">
                      <input value={phone} onChange={(e) => {
                        const newPhones = [...form.phones];
                        newPhones[idx] = e.target.value;
                        setForm({...form, phones: newPhones});
                      }} className="flex-1 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="+256..." />
                      <button type="button" onClick={() => setForm({...form, phones: form.phones.filter((_, i) => i !== idx)})} className="p-2 text-systemRed hover:bg-systemRed/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Emails */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-labelSecondary">Emails</label>
                    <button type="button" onClick={() => setForm({...form, emails: [...form.emails, { type: "customer service", email: "" }]})} className="text-xs font-bold text-systemGreen hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Email
                    </button>
                  </div>
                  {form.emails.map((emailObj, idx) => (
                    <div key={`email-${idx}`} className="flex gap-2">
                      <input value={emailObj.type} onChange={(e) => {
                        const newEmails = form.emails.map((item, i) => i === idx ? { ...item, type: e.target.value } : item);
                        setForm({...form, emails: newEmails});
                      }} className="w-1/3 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="Type (e.g. Sales)" />
                      <input value={emailObj.email} onChange={(e) => {
                        const newEmails = form.emails.map((item, i) => i === idx ? { ...item, email: e.target.value } : item);
                        setForm({...form, emails: newEmails});
                      }} className="flex-1 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="email@example.com" />
                      <button type="button" onClick={() => setForm({...form, emails: form.emails.filter((_, i) => i !== idx)})} className="p-2 text-systemRed hover:bg-systemRed/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Other Contacts */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-labelSecondary">Other Contacts (Socials/Web)</label>
                    <button type="button" onClick={() => setForm({...form, otherContacts: [...form.otherContacts, { type: "", value: "" }]})} className="text-xs font-bold text-systemGreen hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Other
                    </button>
                  </div>
                  {form.otherContacts.map((other, idx) => (
                    <div key={`other-${idx}`} className="flex gap-2">
                      <input value={other.type} onChange={(e) => {
                        const newOther = form.otherContacts.map((item, i) => i === idx ? { ...item, type: e.target.value } : item);
                        setForm({...form, otherContacts: newOther});
                      }} className="w-1/3 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="Type (e.g. Website)" />
                      <input value={other.value} onChange={(e) => {
                        const newOther = form.otherContacts.map((item, i) => i === idx ? { ...item, value: e.target.value } : item);
                        setForm({...form, otherContacts: newOther});
                      }} className="flex-1 bg-background border border-separator rounded-xl px-4 py-2 outline-none focus:border-systemGreen transition-colors" placeholder="Value (e.g. www.site.com)" />
                      <button type="button" onClick={() => setForm({...form, otherContacts: form.otherContacts.filter((_, i) => i !== idx)})} className="p-2 text-systemRed hover:bg-systemRed/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-separator">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-label hover:bg-separator rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 font-bold text-white bg-systemGreen hover:bg-systemGreen/90 disabled:opacity-50 rounded-xl transition-colors">
                  {isSubmitting ? "Saving..." : "Save Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
