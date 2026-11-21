const FactureTracker = artifacts.require("FactureTracker");

module.exports = function (deployer) {
  deployer.deploy(FactureTracker);
};