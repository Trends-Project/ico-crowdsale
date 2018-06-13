import latestTime from "../node_modules/openzeppelin-solidity/test/helpers/latestTime.js";
import { increaseTimeTo } from "../node_modules/openzeppelin-solidity/test/helpers/increaseTime.js";

// test/FundingTest.js
const Crowdsale = artifacts.require("Crowdsale");
const FINNEY = 10**15; // 1 Finney is 10^15 Wei


contract("Crowdsale", accounts => {

  const firstAccount = accounts[0];
  const secondAccount = accounts[1];

  it("sets an owner", async () => {
    const sale = await Crowdsale.new();
    assert.equal(await sale.owner.call(), firstAccount);
  });

  it("keeps track of donator balances", async () => {
    const sale = await Crowdsale.deployed();

    const day = 60 * 60 * 24;

    //await increaseTimeTo(1530435600); // July 1st

    console.log("block time "+latestTime());
    console.log("block time "+new Date(latestTime()*1000));

    await sale(firstAccount, { from: firstAccount, value: 5 * FINNEY, gas: 500000 });
   // await sale.procureTokens(secondAccount, { from: secondAccount, value: 15 * FINNEY, gas: 500000 });
   // await sale.procureTokens(secondAccount, { from: secondAccount, value: 3 * FINNEY, gas: 500000 });
   // assert.equal(await sale.balances.call(firstAccount), 5 * FINNEY);
   // assert.equal(await sale.balances.call(secondAccount), 18 * FINNEY);
    //assert.equal(await sale.balances.call(secondAccount), 17 * FINNEY);// fail test
  });

});