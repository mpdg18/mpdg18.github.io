import { supabase } from "../../../services/supabase";

export async function createTicket(ticketData) {
  const { data, error } = await supabase
    .from("tickets")
    .insert([ticketData]);

  return { data, error };
}

export async function getMyTickets(userId) {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      events (*)
    `)
    .eq("user_id", userId);

  return { data, error };
}

export async function hasTicket(userId, eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  return { data, error };
}

export async function getTicketByCode(ticketCode) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("ticket_code", ticketCode)
    .single();

  return { data, error };
}

export async function checkInTicket(ticketId) {
  const { data, error } = await supabase
    .from("tickets")
    .update({ checked_in: true })
    .eq("id", ticketId);

  return { data, error };
}

export async function getCheckedInTickets(eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .eq("checked_in", true);

  return { data, error };
}


export async function getEventTickets(eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId);

  return { data, error };
}