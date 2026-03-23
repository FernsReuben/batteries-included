import { useEffect, useState } from "react";
import { GET_TICKETS_BY_GROUP, executeGraphQL } from "@/lib/ticket-queries";

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    executeGraphQL<{ tickets: any[] }>(GET_TICKETS_BY_GROUP)
      .then(data => {
        console.log("TICKETS:", data); // 👈 debug
        setTickets(data.tickets);
      })
      .catch(err => {
        console.error("ERROR:", err); // 👈 debug
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Tickets</h1>

      {tickets.length === 0 && <p>No tickets found</p>}

      {tickets.map((t) => (
        <div key={t.id}>
          <strong>{t.subject}</strong> — {t.status}
        </div>
      ))}
    </div>
  );
}