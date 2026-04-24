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

      const response = await fetch("/api/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        throw new Error(data?.error || "Unable to save new center.");
      }

      setCenters((existing) => [...existing, data]);
      setForm(initialFormState);
      setStatus("Center saved to centers.json successfully.");
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to save center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-separator bg-backgroundPrimary p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Manage Centers</h1>
          <p className="mt-2 text-sm text-labelSecondary">
            Add new centers to the JSON data file that the API reads and serves.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                placeholder="Center name"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span>Latitude</span>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(event) => handleChange("latitude", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span>Longitude</span>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(event) => handleChange("longitude", event.target.value)}
                required
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={4}
                className="rounded-3xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                placeholder="Short description of the center"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span>Open hours</span>
              <input
                value={form.open}
                onChange={(event) => handleChange("open", event.target.value)}
                className="rounded-2xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                placeholder="e.g. Weekdays 8 AM - 5 PM"
              />
            </label>

            <div className="md:col-span-2 rounded-3xl border border-separator bg-backgroundLayer1 p-4 space-y-4">
              <div className="text-sm font-medium">Contact information</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-labelSecondary mb-2">Phones</div>
                  {form.phones.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={value}
                        onChange={(event) => updatePhone(index, event.target.value)}
                        className="flex-1 rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                        placeholder="Enter phone number"
                      />
                      {form.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="rounded-full bg-backgroundLayer2 px-3 py-2 text-sm text-labelSecondary"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPhone}
                    className="rounded-3xl bg-backgroundLayer2 px-4 py-2 text-sm text-labelPrimary"
                  >
                    + Add phone
                  </button>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-labelSecondary mb-2">Emails</div>
                  {form.emails.map((entry, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-2">
                      <input
                        value={entry.type}
                        onChange={(event) => updateEmail(index, "type", event.target.value)}
                        className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                        placeholder="Type (e.g. customer service)"
                      />
                      <input
                        value={entry.email}
                        onChange={(event) => updateEmail(index, "email", event.target.value)}
                        className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                        placeholder="Email address"
                      />
                      {form.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmail(index)}
                          className="rounded-full bg-backgroundLayer2 px-3 py-2 text-sm text-labelSecondary md:col-span-2"
                        >
                          Remove email
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmail}
                    className="rounded-3xl bg-backgroundLayer2 px-4 py-2 text-sm text-labelPrimary"
                  >
                    + Add email
                  </button>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-labelSecondary mb-2">Other contacts</div>
                  {form.otherContacts.map((entry, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-2">
                      <input
                        value={entry.type}
                        onChange={(event) => updateOtherContact(index, "type", event.target.value)}
                        className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                        placeholder="Type (fax, helpline, toll free)"
                      />
                      <input
                        value={entry.value}
                        onChange={(event) => updateOtherContact(index, "value", event.target.value)}
                        className="rounded-2xl border border-separator bg-backgroundPrimary px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                        placeholder="Contact detail"
                      />
                      {form.otherContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOtherContact(index)}
                          className="rounded-full bg-backgroundLayer2 px-3 py-2 text-sm text-labelSecondary md:col-span-2"
                        >
                          Remove contact
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOtherContact}
                    className="rounded-3xl bg-backgroundLayer2 px-4 py-2 text-sm text-labelPrimary"
                  >
                    + Add contact detail
                  </button>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>Services</span>
              <textarea
                value={form.services}
                onChange={(event) => handleChange("services", event.target.value)}
                rows={3}
                className="rounded-3xl border border-separator bg-backgroundLayer1 px-4 py-3 text-foreground outline-none focus:border-systemGreen"
                placeholder="List services separated by commas or semicolons"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 inline-flex items-center justify-center rounded-3xl bg-systemGreen px-5 py-3 text-sm font-semibold text-white transition hover:bg-systemGreen/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Add Center"}
            </button>
          </form>

          {status && <div className="mt-4 rounded-3xl border border-systemGreen/30 bg-systemGreen/10 px-4 py-3 text-sm text-systemGreen">{status}</div>}
          {error && <div className="mt-4 rounded-3xl border border-systemRed/30 bg-systemRed/10 px-4 py-3 text-sm text-systemRed">{error}</div>}
        </section>

        <section className="rounded-3xl border border-separator bg-backgroundPrimary p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Centers JSON Database</h2>
              <p className="text-sm text-labelSecondary">The API reads from `public/data/centers.json` and new centers are saved here.</p>
            </div>
            <span className="inline-flex rounded-full bg-backgroundLayer2 px-3 py-1 text-xs text-labelSecondary">{centers.length} centers</span>
          </div>

          <div className="mt-6 grid gap-4">
            {centers.map((center) => (
              <article key={center.id} className="rounded-3xl border border-separator bg-backgroundLayer1 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold">{center.name}</div>
                    <div className="mt-1 text-sm text-labelSecondary">{center.category.label}</div>
                  </div>

                  <div className="text-sm text-labelSecondary">
                    <div>{center.open ?? "No open hours"}</div>
                    <div>{renderContactSummary(center.contact)}</div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-labelSecondary">{center.description ?? "No description provided."}</p>
                {center.services.length > 0 && (
                  <div className="mt-3 text-sm text-labelSecondary">
                    <strong>Services:</strong> {center.services.join(", ")}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
