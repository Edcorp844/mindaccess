"use client";

import { useEffect, useState } from "react";
import ContentPageLayout from "@/components/ContentPageLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PrivacyData {
  title?: string;
  version?: string;
  lastUpdated?: string;
  content?: string;
}

export default function PrivacyPage() {
  const [data, setData] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/privacy")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load privacy policy", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-systemGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ContentPageLayout
      title={data?.title || "Privacy Policy"}
      subtitle={
        data?.version
          ? `Version ${data.version} • Last updated ${data.lastUpdated}`
          : "Last updated April 2026"
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {data?.content || ""}
      </ReactMarkdown>
    </ContentPageLayout>
  );
}
