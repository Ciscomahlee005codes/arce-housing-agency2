// / ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SupabaseDebug() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    const run = async () => {
      // 1. Check env vars
      const url  = import.meta.env.VITE_SUPABASE_URL;
      const key  = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setStatus(`❌ ENV VARS MISSING — url: "${url}" key: "${key ? "present" : "MISSING"}"`);
        return;
      }

      if (!url.startsWith("https://")) {
        setStatus(`❌ VITE_SUPABASE_URL looks wrong: "${url}"`);
        return;
      }

      // 2. Try a real DB call
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        if (error) {
          setStatus(`❌ DB error: ${error.message} (code: ${error.code})`);
        } else {
          setStatus(`✅ Supabase connected. Profiles table reachable. Rows returned: ${data.length}`);
        }
      } catch (err) {
        setStatus(`❌ Network/client error: ${err.message}`);
      }
    };

    run();
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 16, left: 16, zIndex: 9999,
      background: status.startsWith("✅") ? "#dcfce7" : "#fee2e2",
      border: `1px solid ${status.startsWith("✅") ? "#16a34a" : "#dc2626"}`,
      borderRadius: 8, padding: "10px 14px",
      fontSize: 13, fontFamily: "monospace", maxWidth: 480,
      color: status.startsWith("✅") ? "#166534" : "#991b1b",
    }}>
      <strong>Supabase Debug:</strong> {status}
    </div>
  );
}