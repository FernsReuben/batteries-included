// src/components/TicketManager.tsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import {
  executeGraphQL,
  GET_TICKETS_BY_GROUP,
  CREATE_TICKET,
  UPDATE_TICKET_STATUS,
  DELETE_TICKET,
} from "@/lib/ticket-queries";

interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: "open" | "closed";
  groupId: string;
  createdAt: string;
}

interface Props {
  groupId: string;
}

export function TicketManager({ groupId }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const { toast } = useToast();

  const loadTickets = async () => {
    try {
      setLoading(true);

      const data = await executeGraphQL<{ ticketsByGroup: Ticket[] }>(
        GET_TICKETS_BY_GROUP,
        { groupId },
      );

      setTickets(data.ticketsByGroup);
    } catch (error: any) {
      toast({
        title: "Error loading tickets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [groupId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newBody) return;

    try {
      await executeGraphQL(CREATE_TICKET, {
        subject: newSubject,
        body: newBody,
        groupId,
      });
      toast({ title: "Ticket created", description: newSubject });
      setNewSubject("");
      setNewBody("");
      setCreateDialogOpen(false);
      loadTickets();
    } catch (error: any) {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTicketStatus = async (ticket: Ticket) => {
    try {
      const newStatus = ticket.status === "open" ? "closed" : "open";
      await executeGraphQL(UPDATE_TICKET_STATUS, {
        id: ticket.id,
        status: newStatus,
      });
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: newStatus } : t,
        ),
      );
    } catch (error: any) {
      toast({
        title: "Error updating ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      await executeGraphQL(DELETE_TICKET, { id: ticketId });
      setTickets(tickets.filter((t) => t.id !== ticketId));
      toast({ title: "Ticket deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject"
                required
              />
              <Textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Body"
                required
              />
              <Button type="submit" className="w-full">
                Create Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p>Loading tickets...</p>}

      {!loading && tickets.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No tickets for this group.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
              <CardDescription>Status: {ticket.status}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>{ticket.body}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTicketStatus(ticket)}
                >
                  Toggle Status
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTicket(ticket.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
