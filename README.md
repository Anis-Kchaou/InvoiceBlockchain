# Application de facturation avec traçabilité blockchain

Application web de gestion de clients et de factures (CRUD). Chaque nouvelle facture est aussi enregistrée sur une blockchain Ethereum locale via un smart contract Solidity (`FactureTracker`), signée avec MetaMask.

## Architecture

```
tp_blockchain/
├── blockchain/   Truffle : contrat Solidity, migrations, config réseau
└── front/        React (Vite) + json-server (fausse base de données)
```

Flux : React ↔ json-server (CRUD) et React ↔ MetaMask ↔ Ganache (smart contract).

## Prérequis

- Node.js (testé avec v24)
- Truffle et Ganache en global :
  ```bash
  npm install -g truffle ganache
  ```
- Extension MetaMask (Chrome ou Brave)

## Installation

```bash
# Contrat
cd blockchain
# (pas de dépendances npm à installer)

# Front
cd ../front
npm install
```

## Lancement (3 terminaux)

**Terminal A : blockchain locale (laisser ouvert)**
```bash
ganache --server.port 7545 --chain.networkId 5777 --chain.chainId 1337 --wallet.defaultBalance 100 --wallet.deterministic
```
Chaque compte démarre avec 100 ETH. `--wallet.deterministic` donne toujours les mêmes comptes.

**Terminal B : déploiement du contrat** (dans `blockchain/`)
```bash
truffle compile
truffle migrate --reset
copy build\contracts\FactureTracker.json ..\front\src\    # PowerShell
```
À refaire à chaque redémarrage de Ganache : la chaîne repart de zéro et le contrat change d'adresse.

**Terminal C : front** (dans `front/`)
```bash
npm run api     # json-server sur http://localhost:3003
npm run dev     # React sur http://localhost:5173 (ou 5174 si le port est pris)
```

## Configuration MetaMask

1. Ajouter un réseau :
   - URL RPC : `http://127.0.0.1:7545` (avec `http://`)
   - Chain ID : `1337` (et non 5777, qui est le network id)
   - Symbole : `ETH`
2. Importer un compte avec une clé privée affichée par Ganache (*Ajouter un compte → Importer le compte*).
3. Ouvrir l'application dans **Chrome ou Brave**, pas dans le navigateur intégré de VS Code (pas d'extension MetaMask).

> N'utiliser que des clés de test Ganache, jamais un vrai portefeuille.

## Smart contract

`blockchain/contracts/Facture.sol`, contrat `FactureTracker` :

| Élément | Rôle |
|---|---|
| `struct Facture` | client, dateEnvoi, statut, montant, tva, montantTva |
| `mapping(uint256 => Facture) factures` | stockage par identifiant |
| `nextId` | identifiant de la prochaine facture |
| `ajouterFacture(...)` | ajoute une facture, calcule `montantTva = montant * tva / 100` |
| `getFacture(id)` | retourne les détails d'une facture |
| événement `FactureAjoutee` | émis à chaque ajout |

Compilateur fixé à **solc 0.8.19** dans `truffle-config.js` (au-delà, l'opcode `PUSH0` peut être refusé par certaines versions de Ganache).

## Test rapide du contrat

Dans `blockchain/` : `truffle console`, puis **une ligne à la fois** :
```js
let c = await FactureTracker.deployed()
await c.ajouterFacture("Marc", "12/02/2025", "payé", 1250, 12)
await c.getFacture(0)
```
Résultat attendu : `montantTva = 150`.

## Utilisation de l'application

- Onglet **Factures** : ajout, modification, suppression. À l'ajout, MetaMask demande une signature ; le hash de la transaction s'affiche dans la colonne *Tx blockchain*.
- Onglet **Clients** : CRUD simple, sans blockchain.

## Problèmes fréquents

| Symptôme | Cause / solution |
|---|---|
| `This version of µWS is not compatible with your Node.js build` | Avertissement sans conséquence (repli sur une implémentation JavaScript) |
| `CONNECTION ERROR: Couldn't connect to node http://127.0.0.1:7545` | Ganache n'est pas lancé (Terminal A) |
| `Failed to resolve import "web3"` | `npm install web3` dans `front/` |
| `MetaMask non détecté` | Page ouverte hors Chrome/Brave |
| `Contrat non déployé sur ce réseau` | Refaire `truffle migrate --reset`, recopier `FactureTracker.json` dans `front/src/` |
| `nonce too high` après redémarrage de Ganache | MetaMask : *Paramètres → Avancé → Effacer les données d'activité* |
| `json-server` : « No endpoints found » | `db.json` vide ou encodé avec BOM : le recréer en UTF-8 |
| MetaMask refuse le réseau (chain ID déjà utilisé) | Modifier le réseau existant plutôt que d'en ajouter un |
