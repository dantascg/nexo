import { getHomeData } from "@/lib/home";
import InicioView from "./InicioView";

export default async function InicioPage() {
  const data = await getHomeData();
  return <InicioView {...data} />;
}
