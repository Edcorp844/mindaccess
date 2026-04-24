"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Center, type ContactInfo } from "@/utils/center";

type EmailEntry = {
  type: string;
  email: string;
};

type OtherEntry = {
  type: string;
  value: string;
};

type FormState = {
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
  open: string;
  services: string;
  phones: string[];
  emails: EmailEntry[];
  otherContacts: OtherEntry[];
};

const categoryOptions = [
  { value: "Rehabilitaion Centre", label: "Rehabilitation Centre" },
  { value: "Counseling Center", label: "Counseling Center" },
  { value: "Other Facility", label: "Other Facility" },
];

const initialFormState: FormState = {
  name: "",
  category: "Rehabilitaion Centre",
  latitude: "0",
  longitude: "0",
  description: "",
  open: "",
  services: "",
  phones: [""],
  emails: [{ type: "customer service", email: "" }],
  otherContacts: [{ type: "", value: "" }],
};

const normalizeContactPayload = (form: FormState) => {
  const phone = form.phones.map((item) => item.trim()).filter(Boolean);
  const email = form.emails
    .map((item) => ({ type: item.type.trim() || "email", email: item.email.trim() }))
    .filter((item) => item.email);
  const other = form.otherContacts
    .map((item) => ({ type: item.type.trim() || "other", value: item.value.trim() }))
    .filter((item) => item.value);

  const payload: Partial<ContactInfo> = {};
  if (phone.length) payload.phone = phone;
  if (email.length) payload.email = email;
  if (other.length) payload.other = other;
  return payload;
};

const renderContactSummary = (contact?: ContactInfo) => {
  if (!contact) return "No contact info";
  const parts: string[] = [];
  if (contact.phone?.length) parts.push(contact.phone.join(" • "));
  if (contact.email?.length)
    parts.push(...contact.email.map((item) => `${item.type}: ${item.email}`));
  if (contact.other?.length)
    parts.push(...contact.other.map((item) => `${item.type}: ${item.value}`));
  return parts.length ? parts.join(" • ") : "No contact info";
};

export default function Page() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredCenters = centers.filter((center) => {
    const search = searchTerm.toLowerCase();
    return (
      center.name.toLowerCase().includes(search) ||
      center.category.label.toLowerCase().includes(search) ||
      (center.description && center.description.toLowerCase().includes(search))
    );
  });

  const handleEdit = (center: Center) => {
    setEditingId(center.id);
    setForm({
      name: center.name,
      category: center.category.label,
      latitude: String(center.cordinates.latitude),
      longitude: String(center.cordinates.longitude),
      description: center.description || "",
      open: center.open || "",
      services: center.services.join(", "),
      phones: center.contact?.phone && center.contact.phone.length > 0 ? center.contact.phone : [""],
      emails:
        center.contact?.email && center.contact.email.length > 0
          ? center.contact.email
          : [{ type: "customer service", email: "" }],
      otherContacts:
        center.contact?.other && center.contact.other.length > 0
          ? center.contact.other
          : [{ type: "", value: "" }],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialFormState);
    setError("");
    setStatus("");
  };

  useEffect(() => {
    fetch("/api/centers")
      .then((res) => res.json())
      .then((data) => {
        setCenters(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading centers", err);
        setError("Unable to load center data.");
      });
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePhone = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      phones: current.phones.map((entry, idx) => (idx === index ? value : entry)),
    }));
  };

  const addPhone = () => setForm((current) => ({ ...current, phones: [...current.phones, ""] }));
  const removePhone = (index: number) =>
    setForm((current) => ({
      ...current,
      phones: current.phones.filter((_, idx) => idx !== index),
    }));

  const updateEmail = (index: number, field: keyof EmailEntry, value: string) => {
    setForm((current) => ({
      ...current,
      emails: current.emails.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)),
    }));
  };

  const addEmail = () => setForm((current) => ({ ...current, emails: [...current.emails, { type: "", email: "" }] }));
  const removeEmail = (index: number) =>
    setForm((current) => ({
      ...current,
      emails: current.emails.filter((_, idx) => idx !== index),
    }));

  const updateOtherContact = (index: number, field: keyof OtherEntry, value: string) => {
    setForm((current) => ({
      ...current,
      otherContacts: current.otherContacts.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)),
    }));
  };

  const addOtherContact = () =>
    setForm((current) => ({ ...current, otherContacts: [...current.otherContacts, { type: "", value: "" }] }));

  const removeOtherContact = (index: number) =>
    setForm((current) => ({
      ...current,
      otherContacts: current.otherContacts.filter((_, idx) => idx !== index),
    }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const contactPayload = normalizeContactPayload(form);
      const isEditing = editingId !== null;

      const response = await fetch("/api/centers", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? editingId : undefined,
          name: form.name,
          category: form.category,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          description: form.description || undefined,
          open: form.open || undefined,
          services: form.services
            .split(/[,;]+/)
            .map((item) => item.trim())
            .filter(Boolean),
          contact: Object.keys(contactPayload).length ? contactPayload : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Unable to ${isEditing ? "update" : "save new"} center.`);
      }

      if (isEditing) {
        setCenters((existing) => existing.map((c) => (c.id === editingId ? data : c)));
        setEditingId(null);
        setStatus("Center updated successfully.");
      } else {
        setCenters((existing) => [...existing, data]);
        setStatus("Center saved successfully.");
      }

      setForm(initialFormState);
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to save center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* 1. Search & Search Results (Top Focus) */}
        <section className="rounded-3xl border border-separator bg-backgroundPrimary p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold">Search Centers</h2>
                <p className="text-sm text-labelSecondary">
                  Find a center to edit its details.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-backgroundLayer2 px-3 py-1 text-xs text-labelSecondary">
                {filteredCenters.length} / {centers.length} centers
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, category, or description to search..."
                className="w-full rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-5 text-lg outline-none focus:border-systemGreen shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-labelSecondary hover:text-foreground text-2xl"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCenters.length === 0 ? (
              <div className="text-center py-12 text-labelTertiary">No centers found matching "{searchTerm}"</div>
            ) : (
              filteredCenters.map((center) => (
                <article
                  key={center.id}
                  className={`rounded-3xl border transition-all ${
                    editingId === center.id ? "border-systemGreen bg-systemGreen/5 shadow-md" : "border-separator bg-backgroundLayer1 hover:border-systemGreen/50"
                  } p-5`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-semibold">{center.name}</div>
                        <button
                          onClick={() => handleEdit(center)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            editingId === center.id ? "bg-systemGreen text-white" : "bg-backgroundLayer2 text-systemGreen hover:bg-systemGreen/10"
                          }`}
                        >
                          {editingId === center.id ? "Editing..." : "Edit Center"}
                        </button>
                      </div>
                      <div className="mt-1 text-sm text-labelSecondary">{center.category.label}</div>
                    </div>

                    <div className="text-sm text-labelSecondary text-right">
                      <div>{center.open ?? "No open hours"}</div>
                      <div className="truncate max-w-[200px]">{renderContactSummary(center.contact)}</div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* 2. Add / Edit Form (Secondary Focus) */}
        <section id="form-section" className={`rounded-3xl border transition-all duration-500 p-8 shadow-xl ${
          editingId !== null ? "border-systemGreen bg-backgroundPrimary" : "border-separator bg-backgroundPrimary"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{editingId !== null ? "Update Center Information" : "Add New Center"}</h1>
            {editingId !== null ? (
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-backgroundLayer2 text-sm font-medium text-labelSecondary hover:text-foreground"
              >
                Cancel Editing
              </button>
            ) : (
              <div className="text-sm text-labelSecondary italic">Fill out the fields below to add a new entry</div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Center Name</span>
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
                placeholder="e.g. Butabika National Referral Hospital"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Facility Category</span>
              <select
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Latitude</span>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(event) => handleChange("latitude", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Longitude</span>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(event) => handleChange("longitude", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
              <span>Detailed Description</span>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={4}
                className="rounded-3xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
                placeholder="What services do they provide? Who is it for?"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Operating Hours</span>
              <input
                value={form.open}
                onChange={(event) => handleChange("open", event.target.value)}
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
                placeholder="e.g. Mon-Fri 8:00 AM - 6:00 PM"
              />
            </label>

            <div className="md:col-span-2 rounded-3xl border border-separator bg-backgroundLayer1/50 p-6 space-y-6">
              <div className="text-base font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-systemGreen rounded-full"></span>
                Contact Details
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase font-bold tracking-widest text-labelTertiary mb-3">Phone Numbers</div>
                  <div className="space-y-3">
                    {form.phones.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          value={value}
                          onChange={(event) => updatePhone(index, event.target.value)}
                          className="flex-1 rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                          placeholder="+256..."
                        />
                        {form.phones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhone(index)}
                            className="p-2 text-systemRed hover:bg-systemRed/10 rounded-full transition"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addPhone}
                    className="mt-3 text-sm font-semibold text-systemGreen hover:underline"
                  >
                    + Add another phone
                  </button>
                </div>

                <div className="border-t border-separator/30 pt-6">
                  <div className="text-xs uppercase font-bold tracking-widest text-labelTertiary mb-3">Email Addresses</div>
                  <div className="space-y-3">
                    {form.emails.map((entry, index) => (
                      <div key={index} className="grid gap-3 md:grid-cols-2">
                        <input
                          value={entry.type}
                          onChange={(event) => updateEmail(index, "type", event.target.value)}
                          className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                          placeholder="Label (e.g. Info, Emergency)"
                        />
                        <input
                          value={entry.email}
                          onChange={(event) => updateEmail(index, "email", event.target.value)}
                          className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                          placeholder="email@example.com"
                        />
                        {form.emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(index)}
                            className="text-xs text-systemRed hover:underline md:col-span-2 text-right"
                          >
                            Remove email
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addEmail}
                    className="mt-3 text-sm font-semibold text-systemGreen hover:underline"
                  >
                    + Add another email
                  </button>
                </div>

                <div className="border-t border-separator/30 pt-6">
                  <div className="text-xs uppercase font-bold tracking-widest text-labelTertiary mb-3">Other Platforms</div>
                  <div className="space-y-3">
                    {form.otherContacts.map((entry, index) => (
                      <div key={index} className="grid gap-3 md:grid-cols-2">
                        <input
                          value={entry.type}
                          onChange={(event) => updateOtherContact(index, "type", event.target.value)}
                          className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                          placeholder="Platform (e.g. Website, WhatsApp)"
                        />
                        <input
                          value={entry.value}
                          onChange={(event) => updateOtherContact(index, "value", event.target.value)}
                          className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                          placeholder="Handle or URL"
                        />
                        {form.otherContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOtherContact(index)}
                            className="text-xs text-systemRed hover:underline md:col-span-2 text-right"
                          >
                            Remove platform
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOtherContact}
                    className="mt-3 text-sm font-semibold text-systemGreen hover:underline"
                  >
                    + Add another contact
                  </button>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
              <span>Services Offered (comma separated)</span>
              <textarea
                value={form.services}
                onChange={(event) => handleChange("services", event.target.value)}
                rows={3}
                className="rounded-3xl border border-separator bg-backgroundLayer1 px-4 py-4 text-foreground outline-none focus:border-systemGreen transition-all"
                placeholder="Counseling, Rehabilitation, Crisis Intervention..."
              />
            </label>

            <div className="md:col-span-2 flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] inline-flex items-center justify-center rounded-3xl bg-systemGreen px-8 py-5 text-lg font-bold text-white shadow-lg shadow-systemGreen/20 transition active:scale-95 hover:bg-systemGreen/90 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : editingId !== null ? "Save Changes" : "Create New Center"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center rounded-3xl bg-backgroundLayer2 px-8 py-5 text-lg font-bold text-labelPrimary transition active:scale-95 hover:bg-backgroundLayer3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {status && <div className="mt-6 rounded-2xl border border-systemGreen/30 bg-systemGreen/10 px-6 py-4 text-base font-medium text-systemGreen animate-pulse">{status}</div>}
          {error && <div className="mt-6 rounded-2xl border border-systemRed/30 bg-systemRed/10 px-6 py-4 text-base font-medium text-systemRed">{error}</div>}
        </section>
      </div>
    </div>
  );
}
