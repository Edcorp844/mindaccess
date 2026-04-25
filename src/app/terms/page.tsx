"use client";

import { useEffect, useState } from "react";
import ContentPageLayout from "@/components/ContentPageLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TermsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/terms")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ContentPageLayout 
      title={data?.title || "Terms and Conditions"} 
      subtitle={data?.version ? `Version ${data.version} • Last updated ${data.lastUpdated}` : ""}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {data?.content}
      </ReactMarkdown>
    </ContentPageLayout>
  );
}
