import { getSavedItems } from "@/lib/saved";
import SalvosView from "./SalvosView";
export default async function SalvosPage(){ return <SalvosView items={await getSavedItems()} />; }
