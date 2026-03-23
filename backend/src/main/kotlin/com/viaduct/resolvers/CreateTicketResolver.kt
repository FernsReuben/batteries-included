package com.viaduct.resolvers

import com.viaduct.resolvers.resolverbases.MutationResolvers
import com.viaduct.services.TicketService
import viaduct.api.Resolver
import viaduct.api.grts.Ticket

@Resolver
class CreateTicketResolver : MutationResolvers.CreateTicket() {
    override suspend fun resolve(ctx: Context): Ticket {
        val input = ctx.arguments.input
        val userId = ctx.userId

        // ✅ convert GraphQL GlobalID → raw UUID string
        val groupId = input.groupId.internalID

        val entity = ctx.authenticatedClient.createTicket(
            subject = input.subject,
            body = input.body,
            userId = userId,
            groupId = groupId
        )

        return Ticket.Builder(ctx)
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