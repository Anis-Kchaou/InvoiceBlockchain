import { useState } from "react";
import Crud from "./Crud";
import { enregistrerSurBlockchain } from "./blockchain";

const clientFields = [
  { name: "prenom" }, { name: "nom" },
  { name: "email", type: "email" }, { name: "entreprise" },
];
const factureFields = [
  { name: "client" },
  { name: "date_envoi", type: "date" },
  { name: "statut" },
  { name: "montant", type: "number" },
  { name: "tva", type: "number" },
];

export default function App() {
  const [page, setPage] = useState("factures");
  return (
    <div style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <strong>APPLICATION DE FACTURATION</strong>
        <button onClick={() => setPage("factures")}>Factures</button>
        <button onClick={() => setPage("clients")}>Clients</button>
      </nav>

      {page === "factures" ? (
        <Crud resource="factures" fields={factureFields} onCreate={enregistrerSurBlockchain} />
      ) : (
        <Crud resource="clients" fields={clientFields} />
      )}
    </div>
  );
}