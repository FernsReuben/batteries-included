-- Create your resource table
CREATE TABLE IF NOT EXISTS public.ticket_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Ticket-specific fields
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open | closed

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ticket_resources_group_id
    ON public.ticket_resources(group_id);

CREATE INDEX IF NOT EXISTS idx_ticket_resources_user_id
    ON public.ticket_resources(user_id);

-- Enable RLS
ALTER TABLE public.ticket_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tickets from their groups"
    ON public.ticket_resources FOR SELECT
    USING (public.is_group_member(group_id) OR public.is_admin());

CREATE POLICY "Users can create tickets in their groups"
    ON public.ticket_resources FOR INSERT
    WITH CHECK (public.is_group_member(group_id) OR public.is_admin());

CREATE POLICY "Users can update tickets in their groups"
    ON public.ticket_resources FOR UPDATE
    USING (public.is_group_member(group_id) OR public.is_admin());

CREATE POLICY "Users can delete tickets in their groups"
    ON public.ticket_resources FOR DELETE
    USING (public.is_group_member(group_id) OR public.is_admin());

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_ticket_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_ticket_resources_timestamp
    BEFORE UPDATE ON public.ticket_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_resources_updated_at();