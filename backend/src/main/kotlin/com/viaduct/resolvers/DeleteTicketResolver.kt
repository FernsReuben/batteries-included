package com.viaduct.resolvers

import com.viaduct.resolvers.resolverbases.MutationResolvers
import com.viaduct.services.TicketService
import viaduct.api.Resolver

@Resolver
class DeleteTicketResolver : MutationResolvers.DeleteTicket() {
    override suspend fun resolve(ctx: Context): Boolean {
        val input = ctx.arguments.input

        return ctx.authenticatedClient.deleteTicket(input.id.internalID)
    }
}