import styles from "./seguranca.module.css";

const itens = [
  {
    titulo: "Senhas protegidas",
    texto:
      "Sua senha nunca é guardada como você digitou. O serviço de login guarda só uma versão embaralhada (hash), que não dá pra desfazer.",
  },
  {
    titulo: "Senhas vazadas são barradas",
    texto:
      "No cadastro, conferimos se a senha já apareceu em vazamentos. Só os 5 primeiros caracteres de um código derivado dela são consultados, nunca a senha inteira.",
  },
  {
    titulo: "Login que não entrega pistas",
    texto:
      "Se o e-mail ou a senha estiverem errados, a mensagem é sempre a mesma. Assim ninguém descobre quem tem conta aqui.",
  },
  {
    titulo: "Telas só para quem está logado",
    texto:
      "Sem login, nenhuma página interna abre. A verificação acontece no servidor, e não só na tela.",
  },
  {
    titulo: "Só o necessário",
    texto:
      "Pedimos apenas nome e e-mail. Quanto menos dados coletamos, menos coisa pode vazar.",
  },
  {
    titulo: "Conexão criptografada",
    texto: "No site publicado, tudo viaja por HTTPS, o cadeado que aparece no navegador.",
  },
];

export default function ProtecaoNexo() {
  return (
    <section className={styles.protect}>
      <div>
        <h2>Como o Nexo protege seus dados</h2>
        <p className={styles.lead}>
          Segurança não é só aviso: o próprio Nexo foi feito com boas práticas. Veja o que acontece
          por trás da tela quando você cria sua conta e entra.
        </p>
      </div>
      <div className={styles.protGrid}>
        {itens.map((item) => (
          <div className={styles.protItem} key={item.titulo}>
            <span className={styles.protIcon}>✓</span>
            <strong>{item.titulo}</strong>
            <span className={styles.txt}>{item.texto}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
