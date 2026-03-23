package com.viaduct.resolvers

import com.viaduct.resolvers.resolverbases.QueryResolvers
import viaduct.api.Resolver
import viaduct.api.grts.Ticket

@Resolver
class TicketsByGroupResolver : QueryResolvers.TicketsByGroup() {
    override suspend fun resolve(ctx: Context): List<Ticket> {
        val groupId = ctx.arguments.groupId.internalID

        val entities = ctx.authenticatedClient.getTicketsByGroup(groupId)

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
