import React, { useEffect, useState } from "react";
import D3SankeyDiagram from "./D3SankeyDiagram";

export default function FurySankey() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(
      "https://192.168.50.236:8443/ui/mock-data?hours=24&log_limit=500&anomaly_limit=15&iam_changes_limit=10&service=fury&namespace=apps&contains=" +
        encodeURIComponent("Wrong pin entered")
    )
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);

  return <D3SankeyDiagram logs={logs} />;
}