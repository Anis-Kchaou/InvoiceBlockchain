import Web3 from "web3";
import artifact from "./FactureTracker.json";
export async function enregistrerSurBlockchain(f) {
  if (!window.ethereum) throw new Error("MetaMask non détecté");
  const web3 = new Web3(window.ethereum);
  const [account] = await web3.eth.requestAccounts();

  const netId = await web3.eth.net.getId();
  const address = artifact.networks[netId]?.address;
  if (!address) throw new Error("Contrat non déployé sur ce réseau (truffle migrate ?)");

  const contract = new web3.eth.Contract(artifact.abi, address);
  const receipt = await contract.methods
    .ajouterFacture(
      f.client,
      f.date_envoi,
      f.statut,
      Math.round(Number(f.montant)),
      Math.round(Number(f.tva))
    )
    .send({ from: account });

  return receipt.transactionHash;
}