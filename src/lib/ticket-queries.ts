// src/lib/ticket-queries.ts
import { getSupabase } from "@/integrations/supabase/client";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:10000/graphql";
console.log("ENV ENDPOINT:", import.meta.env.VITE_GRAPHQL_ENDPOINT);

/**
 * Execute a GraphQL query or mutation for tickets.
 * Automatically includes authentication headers from Supabase session.
 */
export async function executeGraphQL<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const supabase = getSupabase();
  const { data: { session }, error } = await supabase.auth.getSession();

  console.log("SESSION:", session); // 👈 ADD THIS LINE

  if (error) throw new Error(error.message);
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "X-User-Id": session.user.id,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL error");
  }

  return result.data as T;
}

// ============================================================================
// Ticket Queries & Mutations
// ============================================================================

export const GET_TICKETS_BY_GROUP = `
  query TicketsByGroup($groupId: ID!) {
    ticketsByGroup(groupId: $groupId) {
      id
      subject
      body
      status
      groupId
      createdAt
    }
  }
`;

export const CREATE_TICKET = `
  mutation CreateTicket($subject: String!, $body: String!, $groupId: ID!) {
    createTicket(input: {
      subject: $subject
      body: $body
      groupId: $groupId
    }) {
      id
      subject
      body
      status
      createdAt
    }
  }
`;

export const UPDATE_TICKET_STATUS = `
  mutation UpdateTicket($id: ID!, $status: String) {
    updateTicket(input: {
      id: $id
      status: $status
    }) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_TICKET = `
  mutation DeleteTicket($id: ID!) {
    deleteTicket(input: { id: $id })
  }
`;