package com.viaduct.services

import com.viaduct.AuthenticatedSupabaseClient
import com.viaduct.TicketEntity

class TicketService {

    suspend fun getTickets(
        authenticatedClient: AuthenticatedSupabaseClient
    ): List<TicketEntity> {
        return authenticatedClient.getTickets()
    }

    suspend fun getTicketsByGroup(
        authenticatedClient: AuthenticatedSupabaseClient,
        groupId: String
    ): List<TicketEntity> {
        return authenticatedClient.getTicketsByGroup(groupId)
    }

    suspend fun createTicket(
        authenticatedClient: AuthenticatedSupabaseClient,
        subject: String,
        body: String,
        userId: String,
        groupId: String
    ): TicketEntity {
        return authenticatedClient.createTicket(
            subject = subject,
            body = body,
            userId = userId,
            groupId = groupId
        )
    }

    suspend fun deleteTicket(
        authenticatedClient: AuthenticatedSupabaseClient,
        ticketId: String
    ): Boolean {
        return authenticatedClient.deleteTicket(ticketId)
    }
}