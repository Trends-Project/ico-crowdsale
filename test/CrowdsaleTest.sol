pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Crowdsale.sol";

contract CrowdsaleTest {
    function testSettingAnOwnerDuringCreation() public {
        Crowdsale crowdsale = new Crowdsale();
        Assert.equal(crowdsale.owner(), this, "An owner is different than a deployer");
    }

    function testSettingAnOwnerOfDeployedContract() public {
        Crowdsale sale = Crowdsale(DeployedAddresses.Crowdsale());
        Assert.equal(sale.owner(), msg.sender, "An owner is different than a deployer");
    }
}