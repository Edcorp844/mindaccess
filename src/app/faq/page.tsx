"use client";

import { useEffect, useState } from "react";
import ContentPageLayout from "@/components/ContentPageLayout";
import { Plus, Minus } from "lucide-react";

export default function FAQPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ContentPageLayout 
      title="FAQ" 
      subtitle="Find answers to common questions about MindAccess."
    >
      <div className="space-y-4 not-prose">
        {data?.questions?.map((item: any) => (
          <div 
            key={item.id} 
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300"
          >
            <button 
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="w-full flex justify-between items-center p-6 md:p-8 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-xl md:text-2xl font-bold leading-tight pr-4">{item.question}</span>
              <div className={`p-2 rounded-full transition-all ${openId === item.id ? 'bg-systemGreen text-white rotate-180' : 'bg-separator/20 text-labelSecondary'}`}>
                {openId === item.id ? <Minus size={20} /> : <Plus size={20} />}
              </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${openId === item.id ? 'max-h-[1000px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="p-6 md:p-8 text-lg text-labelSecondary leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ContentPageLayout>
  );
}
