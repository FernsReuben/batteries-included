package com.viaduct.resolvers

import com.viaduct.resolvers.resolverbases.QueryResolvers
import com.viaduct.services.TicketService
import viaduct.api.Resolver
import viaduct.api.grts.Ticket

@Resolver
class TicketsQueryResolver(
    private val ticketService: TicketService
) : QueryResolvers.Tickets() {
    override suspend fun resolve(ctx: Context): List<Ticket> {
        val entities = ticketService.getTickets(ctx.authenticatedClient)

        return entities.map { entity ->
            Ticket.Builder(ctx)
                .id(ctx.globalIDFor(Ticket.Reflection, entity.id))
                .subject(entity.subject)
                .body(entity.body)
                .status(entity.status)
                .userId(entity.user_id)
                .groupId(entity.group_id)
                .createdAt(entity.created_at)
                .updatedAt(entity.updated_at)
                .build()
        }
    }
}