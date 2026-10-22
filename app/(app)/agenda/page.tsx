import { getAgendaEvents } from "@/lib/agenda";
import AgendaView from "./AgendaView";

export default async function AgendaPage() {
  const events = await getAgendaEvents();
  return <AgendaView events={events} />;
}
