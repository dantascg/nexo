"use client";

import Link from "next/link";
import type { Community } from "@/lib/communities";
import { joinCommunity, leaveCommunity } from "./actions";
import styles from "@/app/styles/comunidades.module.css";

function MembershipButton({ community }: { community: Community }) {
  if (community.isMember) return <form action={leaveCommunity}><input type="hidden" name="communityId" value={community.id} /><button className={styles.leaveButton}>Sair</button></form>;
  return <form action={joinCommunity}><input type="hidden" name="communityId" value={community.id} /><button className={styles.joinButton}>Participar</button></form>;
}

export default function ComunidadesView({ communities }: { communities: Community[] }) {
  const featured = communities[0];
  const others = communities.slice(1);
  return <main className={styles.page}>
    <header className={styles.header}><div><div className={styles.eyebrow}>Espaços da escola</div><h1 className={styles.title}>Comunidades</h1><p className={styles.subtitle}>Encontre grupos para conversar, colaborar e participar.</p></div><div className={styles.summary}><strong>{communities.length}</strong><span>comunidades<br />disponíveis</span></div></header>
    {featured ? <section className={styles.featured} style={{ "--accent": featured.color } as React.CSSProperties}><div className={styles.featuredContent}><div className={styles.kicker}>DESTAQUE DA ESCOLA</div><h2>{featured.name}</h2><p>{featured.description}</p><span className={styles.featuredMeta}>{featured.memberCount} participantes</span><div className={styles.featuredActions}><Link className={styles.featuredLink} href={`/comunidades/${featured.slug}`}>Abrir comunidade</Link><MembershipButton community={featured} /></div></div><div className={styles.featuredOrb} /></section> : <div className={styles.empty}><strong>Nenhuma comunidade disponível</strong><p>Quando houver grupos, eles aparecerão aqui.</p></div>}
    {others.length > 0 && <section><div className={styles.sectionHeader}><div><h2>Todos os grupos</h2><p>Participe das conversas que combinam com você.</p></div><span>{others.length} opções</span></div><div className={styles.grid}>{others.map((community) => <article className={styles.card} key={community.id}><div className={styles.cardTop}><div className={styles.icon} style={{ background: community.color }}>{community.name.slice(0, 2).toUpperCase()}</div><span className={styles.visibility}>{community.visibility === "school" ? "Toda a escola" : "Privada"}</span></div><Link className={styles.cardLink} href={`/comunidades/${community.slug}`}><h3>{community.name}</h3></Link><p>{community.description}</p><div className={styles.cardFooter}><span>{community.memberCount} participantes</span><MembershipButton community={community} /></div></article>)}</div></section>}
  </main>;
}
