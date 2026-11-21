// Petite note pour les parents, sous les champs de saisie de l'Entraînement.
// Les réglages HTML ne suffisent pas à empêcher le clavier du téléphone de proposer
// des mots (qui donneraient la réponse) : seul le réglage du clavier le permet.
export default function NoteParentsClavier() {
  return (
    <p
      style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: "0.72rem",
        lineHeight: 1.5,
        textAlign: "center",
        maxWidth: "420px",
        margin: "10px auto 0",
      }}
    >
      Sur certains téléphones, coupe la saisie prédictive dans les réglages du clavier pour que
      les mots ne soient pas proposés.
    </p>
  );
}
