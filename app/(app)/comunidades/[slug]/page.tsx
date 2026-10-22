import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/lib/community";
import CommunityDetailView from "./CommunityDetailView";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();
  return <CommunityDetailView community={community} />;
}
