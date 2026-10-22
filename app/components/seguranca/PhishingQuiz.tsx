"use client";

import { useState } from "react";
import styles from "./seguranca.module.css";

type Mensagem = {
  canal: "E-mail" | "WhatsApp" | "SMS" | "Instagram";
  de: string;
  assunto?: string;
  anexo?: string;
  corpo: string;
  golpe: boolean;
  titulo: string;
  pistas: string[];
};

// Todas as mensagens são fictícias, feitas só para este quiz.
const MENSAGENS: Mensagem[] = [
  {
    canal: "E-mail",
    de: "Suporte do Portal <suporte@portal-escolar-seguro.com.co>",
    assunto: "⚠ URGENTE: sua conta será bloqueada em 24 horas",
    corpo:
      "Prezado(a) aluno(a),\n\nDetectamos um acesso suspeito na sua conta. Para evitar o bloqueio, confirme seus dados agora:\n\nhttp://portal-escolar-confirmar.com/login\n\nSe não confirmar em 24h, sua matrícula poderá ser cancelada.",
    golpe: true,
    titulo: "Phishing clássico por e-mail",
    pistas: [
      "O endereço do remetente não é o domínio oficial da escola.",
      "Pressão de tempo: 24 horas pra não perder a conta.",
      "O link leva a um site que não é o oficial, e começa com http, sem cadeado.",
      "Saudação genérica, sem o seu nome.",
    ],
  },
  {
    canal: "WhatsApp",
    de: "Número desconhecido",
    corpo:
      "Oi, tudo bem? Mudei de número, salva esse novo aí 😊\n\nPreciso de um favor urgente: meu app do banco travou. Consegue fazer um Pix de R$ 480 pra esse contato? Te devolvo amanhã sem falta!",
    golpe: true,
    titulo: "Golpe do \"mudei de número\"",
    pistas: [
      "O golpista copia a foto de alguém que você conhece.",
      "Pede dinheiro com urgência e uma desculpa pra não ligar.",
      "Antes de qualquer Pix, ligue para o número antigo ou chame por vídeo.",
    ],
  },
  {
    canal: "SMS",
    de: "Nexo Escolar",
    corpo:
      "Seu código de verificação é 482 913. Ele vale por 10 minutos. Não compartilhe com ninguém, nem com a equipe do Nexo.",
    golpe: false,
    titulo: "Legítimo, se foi você que acabou de pedir",
    pistas: [
      "Chegou logo depois de você tentar entrar na sua conta.",
      "Não tem link e não pede nada além de digitar o código no app.",
      "Ele mesmo avisa: não compartilhe. O problema começa quando alguém PEDE esse código.",
    ],
  },
  {
    canal: "SMS",
    de: "Entregas",
    corpo:
      "Sua encomenda não pôde ser entregue. Pague a taxa de reenvio de R$ 7,90 para liberar: bit.ly/entrega-ja-82x",
    golpe: true,
    titulo: "Golpe da taxa de entrega",
    pistas: [
      "Você nem lembrava de ter comprado algo, e a mensagem não diz o que é.",
      "A taxa é pequena de propósito: o objetivo é pegar os dados do seu cartão.",
      "Link encurtado esconde o destino real.",
    ],
  },
  {
    canal: "Instagram",
    de: "sorteio.oficial.premios",
    corpo:
      "🎉 PARABÉNS! Você foi sorteado(a) e ganhou um celular novo!\nPra receber, é só pagar o frete de R$ 29,90 pelo link da bio. Responda em até 1 hora pra não perder o prêmio!",
    golpe: true,
    titulo: "Falso sorteio",
    pistas: [
      "Você não participou de sorteio nenhum.",
      "Prêmio que exige pagamento antecipado não é prêmio.",
      "Prazo curtíssimo para você não pensar.",
    ],
  },
  {
    canal: "E-mail",
    de: "Secretaria <secretaria@colegiohorizonte.edu.br>",
    assunto: "Reunião de responsáveis remarcada",
    corpo:
      "Olá, famílias e estudantes.\n\nA reunião de responsáveis foi remarcada para 27 de junho, às 19h, no auditório. Não é necessário responder este e-mail.\n\nQualquer dúvida, procure a secretaria no horário de atendimento.",
    golpe: false,
    titulo: "Comunicado legítimo",
    pistas: [
      "Domínio institucional da escola.",
      "Nenhum link, nenhum pedido de dados ou de dinheiro.",
      "A informação confere com o mural e o app da escola.",
      "Tom normal, sem urgência. Desconfie do pedido, não do formato.",
    ],
  },
  {
    canal: "E-mail",
    de: "Financeiro <financeiro@mensalidades-online.net>",
    assunto: "Boleto da mensalidade em atraso – 2ª via",
    anexo: "boleto_2via.pdf.exe",
    corpo:
      "Olá,\n\nSegue em anexo a 2ª via do boleto em atraso. Abra o arquivo para evitar protesto no seu nome.",
    golpe: true,
    titulo: "Anexo malicioso",
    pistas: [
      "\".pdf.exe\" é um programa disfarçado de PDF. Boleto de verdade nunca é executável.",
      "Ameaça de protesto para você agir sem pensar.",
      "Remetente que você não conhece, cobrando algo que você não deve.",
    ],
  },
  {
    canal: "WhatsApp",
    de: "Atendimento (não salvo)",
    corpo:
      "Olá! Enviamos um código de 6 dígitos para o seu número por engano. Pode nos informar o código que chegou por SMS? É rapidinho 🙏",
    golpe: true,
    titulo: "Golpe do código por engano",
    pistas: [
      "O código por SMS é a chave da sua conta (WhatsApp, banco, redes). Quem pede quer entrar nela.",
      "Nenhuma empresa séria pede código recebido por SMS.",
      "O tom simpático e o \"rapidinho\" servem para você baixar a guarda.",
    ],
  },
];

export default function PhishingQuiz() {
  const [indice, setIndice] = useState(0);
  const [marcouGolpe, setMarcouGolpe] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);

  const total = MENSAGENS.length;
  const msg = MENSAGENS[indice];
  const respondeu = marcouGolpe !== null;
  const acertou = respondeu && marcouGolpe === msg.golpe;

  function responder(escolha: boolean) {
    if (respondeu) return;
    setMarcouGolpe(escolha);
    if (escolha === msg.golpe) setAcertos((a) => a + 1);
  }

  function proxima() {
    if (indice + 1 >= total) {
      setFim(true);
    } else {
      setIndice(indice + 1);
      setMarcouGolpe(null);
    }
  }

  function reiniciar() {
    setIndice(0);
    setMarcouGolpe(null);
    setAcertos(0);
    setFim(false);
  }

  const mensagemFinal =
    acertos >= total - 1
      ? "Você está afiado(a)! Continue desconfiando de pedidos de dados, dinheiro e códigos."
      : acertos >= total - 3
        ? "Foi bem, mas alguns golpes passaram. Revise as pistas e tente de novo."
        : "Cuidado! Esses golpes enganam muita gente. Releia as pistas e tente outra vez.";

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitle}>Isso é phishing?</div>
        <div className={styles.cardSub}>
          Leia a mensagem e decida: golpe ou legítima? Algumas são verdadeiras, porque nem tudo é
          golpe.
        </div>
      </div>

      {fim ? (
        <div className={styles.result}>
          <div className={styles.score}>
            {acertos}/{total}
          </div>
          <div className={styles.cardTitle}>{mensagemFinal}</div>
          <div>
            <button className={styles.btn} onClick={reiniciar}>
              Jogar de novo
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${(indice / total) * 100}%` }} />
          </div>

          <div className={styles.msg}>
            <div className={styles.msgTop}>
              <span className={styles.canal}>{msg.canal}</span>
              <span className={styles.counter}>
                {indice + 1} de {total}
              </span>
            </div>
            <div className={styles.meta}>
              <b>De:</b> {msg.de}
            </div>
            {msg.assunto && (
              <div className={styles.meta}>
                <b>Assunto:</b> {msg.assunto}
              </div>
            )}
            {msg.anexo && (
              <div className={styles.meta}>
                <b>Anexo:</b> <span className={styles.attach}>📎 {msg.anexo}</span>
              </div>
            )}
            <div className={styles.body}>{msg.corpo}</div>
          </div>

          {!respondeu ? (
            <div className={styles.answers}>
              <button className={styles.answerBad} onClick={() => responder(true)}>
                É golpe
              </button>
              <button className={styles.answerOk} onClick={() => responder(false)}>
                É legítima
              </button>
            </div>
          ) : (
            <div className={`${styles.feedback} ${acertou ? styles.fbOk : styles.fbBad}`}>
              <strong>
                {acertou ? "Acertou!" : "Quase!"} {msg.golpe ? "Isso era golpe." : "Essa era legítima."}
              </strong>
              <div>
                <b>{msg.titulo}</b>
              </div>
              <ul>
                {msg.pistas.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div>
                <button className={styles.btn} onClick={proxima}>
                  {indice + 1 >= total ? "Ver resultado" : "Próxima"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
