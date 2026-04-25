"use client";

import { useEffect, useState } from "react";
import ContentPageLayout from "@/components/ContentPageLayout";
import { ExternalLink, Code } from "lucide-react";

export default function LicensesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/licenses/web")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ContentPageLayout 
      title="Software Licenses" 
      subtitle="The open-source libraries and tools that power the MindAccess web experience."
    >
      <div className="space-y-8 not-prose">
        {data?.libraries?.map((lib: any, idx: number) => (
          <div 
            key={idx} 
            className="bg-white/5 border border-white/10 p-8 rounded-[32px] group hover:border-systemGreen/30 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black mb-1 flex items-center gap-2">
                  <Code className="text-systemGreen" size={24} />
                  {lib.name}
                </h3>
                <span className="text-xs font-black uppercase tracking-widest text-systemGreen bg-systemGreen/10 px-3 py-1 rounded-full">
                  {lib.licenseType}
                </span>
              </div>
              {lib.url && (
                <a 
                  href={lib.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-labelSecondary hover:text-systemGreen transition-colors"
                >
                  View Source <ExternalLink size={16} />
                </a>
              )}
            </div>
            <div className="p-5 bg-black/20 rounded-2xl font-mono text-sm text-labelSecondary leading-relaxed border border-white/5">
              {lib.content}
            </div>
          </div>
        ))}
      </div>
    </ContentPageLayout>
  );
}
