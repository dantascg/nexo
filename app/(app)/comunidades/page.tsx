import { getCommunities } from "@/lib/communities";
import ComunidadesView from "./ComunidadesView";

export default async function ComunidadesPage() {
  const communities = await getCommunities();
  return <ComunidadesView communities={communities} />;
}
