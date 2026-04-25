"use client";

import { useEffect, useState } from "react";
import ContentPageLayout from "@/components/ContentPageLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function HelpPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/help")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ContentPageLayout 
      title="Help & Support" 
      subtitle="How can we assist you today?"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 not-prose">
        <ContactCard 
          icon={Mail} 
          label="Email Us" 
          value={data?.contact?.email} 
          href={`mailto:${data?.contact?.email}`}
        />
        <ContactCard 
          icon={Phone} 
          label="Call Us" 
          value={data?.contact?.phone} 
          href={`tel:${data?.contact?.phone}`}
        />
      </div>

      <div className="bg-systemGreen/5 border border-systemGreen/20 rounded-3xl p-6 mb-12 flex items-start gap-4 not-prose">
        <div className="p-3 bg-systemGreen rounded-2xl text-white">
          <MessageCircle size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black mb-1">Looking for FAQs?</h3>
          <p className="text-labelSecondary font-medium mb-4">{data?.faq}</p>
          <a href="/faq" className="inline-block bg-systemGreen text-white font-black px-6 py-2 rounded-xl hover:scale-105 transition-transform active:scale-95">
            Visit Help Center
          </a>
        </div>
      </div>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {data?.content}
      </ReactMarkdown>
    </ContentPageLayout>
  );
}

function ContactCard({ icon: Icon, label, value, href }: any) {
  return (
    <a 
      href={href}
      className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-systemGreen/50 transition-all hover:bg-white/10 group"
    >
      <Icon className="text-systemGreen mb-4 group-hover:scale-110 transition-transform" size={32} />
      <div className="text-sm font-black uppercase tracking-widest text-labelSecondary mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </a>
  );
}
