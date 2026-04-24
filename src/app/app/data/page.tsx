"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Center, type ContactInfo } from "@/utils/center";
import { Edit, Plus, X, ChevronRight, MapPin } from "lucide-react";

type EmailEntry = {
  type: string;
  email: string;
};

type OtherEntry = {
  type: string;
  value: string;
};

type FormState = {
  id?: number;
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
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCenters = centers.filter((center) => {
    const search = searchTerm.toLowerCase();
    return (
      center.name.toLowerCase().includes(search) ||
      center.category.label.toLowerCase().includes(search) ||
      (center.description && center.description.toLowerCase().includes(search))
    );
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = () => {
    fetch("/api/centers")
      .then((res) => res.json())
      .then((data) => {
        setCenters(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading centers", err);
        setError("Unable to load center data.");
      });
  };

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

  const handleNewCenter = () => {
    setForm(initialFormState);
    setEditingId(null);
    setError("");
    setStatus("");
    setMode("create");
  };

  const handleEditCenter = (center: Center) => {
    setEditingId(center.id);
    setForm({
      id: center.id,
      name: center.name,
      category: center.category.value,
      latitude: center.cordinates.latitude.toString(),
      longitude: center.cordinates.longitude.toString(),
      description: center.description || "",
      open: center.open || "",
      services: center.services.join(", "),
      phones: center.contact?.phone || [""],
      emails: center.contact?.email || [{ type: "customer service", email: "" }],
      otherContacts: center.contact?.other || [{ type: "", value: "" }],
    });
    setError("");
    setStatus("");
    setMode("edit");
  };

  const handleCancel = () => {
    setForm(initialFormState);
    setEditingId(null);
    setError("");
    setStatus("");
    setMode("list");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const contactPayload = normalizeContactPayload(form);

      const isEditing = mode === "edit";
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
        throw new Error(data?.error || "Unable to save center.");
      }

      if (mode === "edit") {
        setCenters((existing) =>
          existing.map((c) => (c.id === form.id ? data : c))
        );
        setStatus("Center updated successfully!");
      } else {
        setCenters((existing) => [...existing, data]);
        setStatus("Center created successfully!");
      }

      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to save center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        {mode === "list" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Manage Centers</h1>
              <p className="mt-2 text-sm text-labelSecondary">
                Add or edit mental health centers in the network
              </p>
            </div>
            <button
              onClick={handleNewCenter}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-systemGreen px-6 py-3 font-semibold text-white hover:bg-systemGreen/90 transition sm:px-8"
            >
              <Plus className="w-5 h-5" />
              <span>Add Center</span>
            </button>
          </div>
        )}

        {/* Form Section */}
        {(mode === "create" || mode === "edit") && (
          <div className="rounded-3xl border border-separator bg-backgroundPrimary p-6 sm:p-8 md:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {mode === "create" ? "Add New Center" : "Edit Center"}
                </h2>
                <p className="mt-1 text-sm text-labelSecondary">
                  {mode === "create"
                    ? "Create a new mental health center"
                    : "Update the center information"}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-backgroundLayer1 rounded-full transition"
              >
                <X className="w-6 h-6 text-labelSecondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Name *</span>
                    <input
                      value={form.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      required
                      className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen transition"
                      placeholder="Center name"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Category *</span>
                    <select
                      value={form.category}
                      onChange={(event) => handleChange("category", event.target.value)}
                      className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen transition"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    rows={3}
                    className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen transition resize-none"
                    placeholder="Short description of the center"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Operating Hours</span>
                  <input
                    value={form.open}
                    onChange={(event) => handleChange("open", event.target.value)}
                    className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen transition"
                    placeholder="e.g. Weekdays 8 AM - 5 PM"
                  />
                </label>
              </div>

              {/* Location */}
              <div className="space-y-4 rounded-2xl border border-separator bg-backgroundLayer1 p-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-systemGreen" />
                  Location
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Latitude *</span>
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(event) => handleChange("latitude", event.target.value)}
                      required
                      className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Longitude *</span>
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(event) => handleChange("longitude", event.target.value)}
                      required
                      className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition"
                    />
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 rounded-2xl border border-separator bg-backgroundLayer1 p-4">
                <h3 className="text-base font-semibold">Contact Information</h3>

                {/* Phones */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide font-medium text-labelSecondary">Phones</div>
                  {form.phones.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={value}
                        onChange={(event) => updatePhone(index, event.target.value)}
                        className="flex-1 rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition"
                        placeholder="Phone number"
                      />
                      {form.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="p-2 rounded-lg hover:bg-backgroundLayer2 transition"
                        >
                          <X className="w-4 h-4 text-labelSecondary" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPhone}
                    className="text-sm font-medium text-systemGreen hover:text-systemGreen/80 transition"
                  >
                    + Add phone
                  </button>
                </div>

                {/* Emails */}
                <div className="space-y-3 border-t border-separator pt-4">
                  <div className="text-xs uppercase tracking-wide font-medium text-labelSecondary">Emails</div>
                  {form.emails.map((entry, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={entry.type}
                        onChange={(event) => updateEmail(index, "type", event.target.value)}
                        className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition"
                        placeholder="Type (e.g. customer service)"
                      />
                      <input
                        value={entry.email}
                        onChange={(event) => updateEmail(index, "email", event.target.value)}
                        className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition sm:col-span-1"
                        placeholder="Email address"
                      />
                      {form.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmail(index)}
                          className="p-2 rounded-lg hover:bg-backgroundLayer2 transition sm:col-span-2"
                        >
                          <X className="w-4 h-4 text-labelSecondary" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmail}
                    className="text-sm font-medium text-systemGreen hover:text-systemGreen/80 transition"
                  >
                    + Add email
                  </button>
                </div>

                {/* Other Contacts */}
                <div className="space-y-3 border-t border-separator pt-4">
                  <div className="text-xs uppercase tracking-wide font-medium text-labelSecondary">Other Contacts</div>
                  {form.otherContacts.map((entry, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={entry.type}
                        onChange={(event) => updateOtherContact(index, "type", event.target.value)}
                        className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition"
                        placeholder="Type (fax, helpline, toll free)"
                      />
                      <input
                        value={entry.value}
                        onChange={(event) => updateOtherContact(index, "value", event.target.value)}
                        className="rounded-xl border border-separator bg-backgroundPrimary px-3 py-2 text-foreground outline-none focus:border-systemGreen transition sm:col-span-1"
                        placeholder="Contact detail"
                      />
                      {form.otherContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOtherContact(index)}
                          className="p-2 rounded-lg hover:bg-backgroundLayer2 transition sm:col-span-2"
                        >
                          <X className="w-4 h-4 text-labelSecondary" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOtherContact}
                    className="text-sm font-medium text-systemGreen hover:text-systemGreen/80 transition"
                  >
                    + Add contact
                  </button>
                </div>
              </div>

              {/* Services */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Services</span>
                <textarea
                  value={form.services}
                  onChange={(event) => handleChange("services", event.target.value)}
                  rows={2}
                  className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen transition resize-none"
                  placeholder="List services separated by commas or semicolons"
                />
              </label>

              {/* Messages */}
              {status && (
                <div className="rounded-2xl border border-systemGreen/30 bg-systemGreen/10 px-4 py-3 text-sm text-systemGreen font-medium">
                  {status}
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-systemRed/30 bg-systemRed/10 px-4 py-3 text-sm text-systemRed font-medium">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-separator">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-foreground font-semibold rounded-full border border-separator hover:bg-backgroundLayer1 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-systemGreen text-white font-semibold rounded-full hover:bg-systemGreen/90 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create Center" : "Update Center"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Centers List */}
        {mode === "list" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                {filteredCenters.length} {filteredCenters.length === 1 ? "Center" : "Centers"}
                {searchTerm && <span className="text-sm font-normal text-labelSecondary ml-2">(filtered from {centers.length})</span>}
              </h2>
              
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, category, or description..."
                  className="w-full rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-sm outline-none focus:border-systemGreen shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-labelSecondary hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {centers.length === 0 ? (
              <div className="rounded-3xl border border-separator bg-backgroundLayer1 p-8 sm:p-12 text-center">
                <p className="text-labelSecondary mb-6">No centers yet. Create one to get started.</p>
                <button
                  onClick={handleNewCenter}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-systemGreen px-8 py-3 font-semibold text-white hover:bg-systemGreen/90 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create First Center</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    className="rounded-2xl border border-separator bg-backgroundPrimary p-4 sm:p-6 hover:bg-backgroundLayer1 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                          {center.name}
                        </h3>
                        <p className="text-sm text-labelSecondary mt-1">{center.category.label}</p>
                        <p className="text-xs text-labelSecondary mt-3 line-clamp-2">
                          {center.description || "No description"}
                        </p>
                        <p className="text-xs text-labelSecondary mt-2">
                          {renderContactSummary(center.contact)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditCenter(center)}
                        className="p-2 sm:p-3 rounded-full bg-backgroundLayer1 text-systemGreen hover:bg-systemGreen/10 transition flex-shrink-0"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
