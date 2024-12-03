"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProctoringMonitor } from "src/components/ProctoringMonitor";

export default function ProctoringPage() {
  const router = useRouter();
  const { url } = router.query;
  const [proctoringEnabled, setProctoringEnabled] = useState(false);

  useEffect(() => {
    if (url) {
      setProctoringEnabled(true);
    }
  }, [url]);

  if (!url) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Proctoring Test</h1>
      <div style={{ display: "flex" }}>
        <iframe
          src={url as string}
          style={{ flex: 1, height: "100vh", border: "none" }}
          title="Test"
        />
        <div style={{ position: "absolute", top: 0, left: 0, zIndex: 100 }}>
          {proctoringEnabled && <ProctoringMonitor />}
        </div>
      </div>
    </div>
  );
}
