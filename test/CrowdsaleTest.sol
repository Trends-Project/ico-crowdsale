pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Crowdsale.sol";

contract CrowdsaleTest {

    uint public initialBalance = 10 ether;

    function testSettingAnOwnerDuringCreation() public {
        Crowdsale crowdsale = new Crowdsale();
        Assert.equal(crowdsale.owner(), this, "An owner is different than a deployer");
    }

    function testSettingAnOwnerOfDeployedContract() public {
        Crowdsale sale = Crowdsale(DeployedAddresses.Crowdsale());
        Assert.equal(sale.owner(), msg.sender, "An owner is different than a deployer");
    }

    function testGetICORate() public {
        Crowdsale crowdsale = new Crowdsale();

        // uint256 preIcoBonusRound1 = 300
        // uint256 preIcoBonusRound2 = 200
        // uint256 mainIcoBonus = 100
        // uint256 mainIcoBonusDeltaPerDay = 2

        // Values from Excel sheet
uint256 preIcoRateBonus1 = 3812;
uint256 preIcoRateBonus2 = 3519;
uint256 mainIcoDay1 = 2420;
uint256 mainIcoDay2 = 2415;
uint256 mainIcoDay7 = 2393;
uint256 mainIcoDay39 = 2252;
uint256 mainIcoLastDay = 2200;

        uint256 date;
        _doAssert("rate is wong on date", date, 0);
        
        date = 1530435600;              // July 1 - first day of sale
        _doAssert("rate is wong on before sale", date-1, 0);
        _doAssert("rate is wong on pre ico", date, preIcoRateBonus1);
        _doAssert("rate is wong on pre ico", date+1, preIcoRateBonus1);

        date = 1531731600;              // July 16 9:00 am GMT - pre ico 2nd round
        _doAssert("rate is wong on pre ico 1", date-1, preIcoRateBonus1);
        _doAssert("rate is wong on 2", date, preIcoRateBonus2);
        _doAssert("rate is wong on 2", date+1, preIcoRateBonus2);

        date = 1533027600;              // 07/31/2018 @ 9:00am (UTC) // pre ico end
        _doAssert("rate is wong on main day 2", date-1, preIcoRateBonus2);
        _doAssert("rate is wong on main day 2", date, preIcoRateBonus2);
        _doAssert("rate is wong after end of pre ico", date+1, 0);


        date = 1534323600;              // 08/15/2018 @ 9:00am (UTC) // main ico start
        _doAssert("rate is wong on main", date-1, 0);
        _doAssert("rate is wong on main", date, mainIcoDay1);
        _doAssert("rate is wong on main", date+1, mainIcoDay1);

        uint256 icoDay1 = date;
        uint256 day = 60 * 60 * 24;

        date = icoDay1 + day;           // main ico day 2
        _doAssert("rate is wong on main day 1", date-1, mainIcoDay1);
        _doAssert("rate is wong on main 2", date, mainIcoDay2);
        _doAssert("rate is wong on main 2", date+1, mainIcoDay2);

        date = icoDay1 + 7 * day;         // main ico day 7
        //_doAssert("rate is wong on date", day2-1, mainIcoDay1);
        _doAssert("rate is wong on main 7", date, mainIcoDay7);
        _doAssert("rate is wong on main 7", date+1, mainIcoDay7);

        date = icoDay1 + 39 * day;        // main ico day 39
        //_doAssert("rate is wong on date", day2-1, mainIcoDay1);
        _doAssert("rate is wong on main 39", date, mainIcoDay39);
        _doAssert("rate is wong on main 39", date+1, mainIcoDay39);

        date = 1538557200 - day;          // 10/03/2018 @ 9:00am (UTC) main ico last day
       _doAssert("rate is wong on last", date, mainIcoLastDay);
        _doAssert("rate is wong on last", date+1, mainIcoLastDay);
        _doAssert("rate is wong on last", date+day-1, mainIcoLastDay);
        _doAssert("rate is wong past last", date+day, 0);

    }

    function _doAssert(string message, uint256 date, uint256 rate) {        
        //Crowdsale crowdsale = new Crowdsale();
        Crowdsale crowdsale = Crowdsale(DeployedAddresses.Crowdsale());

        Assert.equal(crowdsale.getRateIcoWithBonusByDate(date), rate, message);
    }
}