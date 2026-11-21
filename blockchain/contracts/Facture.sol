// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FactureTracker {
    struct Facture {
        string client;
        string dateEnvoi;
        string statut;
        uint256 montant;
        uint256 tva;
        uint256 montantTva;
    }

    mapping(uint256 => Facture) public factures;
    uint256 public nextId;

    event FactureAjoutee(uint256 indexed id, string client, uint256 montant);

    function ajouterFacture(
        string memory client,
        string memory dateEnvoi,
        string memory statut,
        uint256 montant,
        uint256 tva
    ) public {
        uint256 montantTva = (montant * tva) / 100;
        factures[nextId] = Facture(client, dateEnvoi, statut, montant, tva, montantTva);
        emit FactureAjoutee(nextId, client, montant);
        nextId++;
    }

    function getFacture(uint256 id)
        public
        view
        returns (string memory, string memory, string memory, uint256, uint256, uint256)
    {
        Facture memory f = factures[id];
        return (f.client, f.dateEnvoi, f.statut, f.montant, f.tva, f.montantTva);
    }
}