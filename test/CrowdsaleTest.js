import latestTime from "../node_modules/openzeppelin-solidity/test/helpers/latestTime.js";
import { increaseTimeTo } from "../node_modules/openzeppelin-solidity/test/helpers/increaseTime.js";
import { advanceBlock } from '../node_modules/openzeppelin-solidity/test/helpers/advanceToBlock';

// test/FundingTest.js
const Crowdsale = artifacts.require("Crowdsale");
const FINNEY = 10**15; // 1 Finney is 10^15 Wei


contract("Crowdsale", accounts => {

  const firstAccount = accounts[0];
  const secondAccount = accounts[1];

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });

  it("sets an owner", async function () {
    var crowdsale = await Crowdsale.deployed();
    assert.equal(await crowdsale.owner.call(), firstAccount);
  });

  it("sets start date for Pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1530522000; // July 2, 2018, 09:00 GMT
    const defaultDate = 1530435600; // July 1
    assert.equal(await crowdsale.startIcoPreICO.call(), defaultDate);
    // set the date to a new date
    await crowdsale.setStartIcoPreICO(date);
    var aNewDate = await crowdsale.startIcoPreICO.call();
    assert.equal(aNewDate, date);
    assert.notEqual(aNewDate, defaultDate);

    // reset to default
    await crowdsale.setStartIcoPreICO(defaultDate);
  });

  it("sets END date for Pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1533017600; // date before the original pre ico
    const defaultDate = 1533027600; // July 31
    assert.equal(await crowdsale.endIcoPreICO.call(), defaultDate);
    // set the date to a new date
    await crowdsale.setEndIcoPreICO(date);
    var aNewDate = await crowdsale.endIcoPreICO.call();
    assert.equal(aNewDate, date);
    assert.notEqual(aNewDate, defaultDate);

    // reset to default
    await crowdsale.setEndIcoPreICO(defaultDate);
  });

  it("sets start date for Pre-ICO, 2nd round", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1530522000; // July 2, 2018, 09:00 GMT
    const defaultDate = 1531731600; // July 16
    assert.equal(await crowdsale.startIcoPreICO2ndRound.call(), defaultDate);
    await crowdsale.setStartIcoPreICO2ndRound(date);

    var aNewDate = await crowdsale.startIcoPreICO2ndRound.call();
    assert.equal(aNewDate, date);

    // reset to default
    await crowdsale.setStartIcoPreICO2ndRound(defaultDate);
  });

  it("sets START date for main ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultDate = 1534323600;        // 08/15/2018 @ 9:00am (UTC)
    const date = defaultDate + 15 * 24 * 60 * 60; // 8/30
    assert.equal(await crowdsale.startIcoMainSale.call(), defaultDate);
    await crowdsale.setStartIcoMainICO(date);
    var aNewDate = await crowdsale.startIcoMainSale.call();
    assert.equal(aNewDate, date);

    // reset to default
    await crowdsale.setStartIcoMainICO(defaultDate);
  });

  it("sets END date for main ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultDate = 1538557200;        
    const date = defaultDate + 29 * 24 * 60 * 60; 
    assert.equal(await crowdsale.endIcoMainSale.call(), defaultDate);
    await crowdsale.setEndIcoMainICO(date);
    var aNewDate = await crowdsale.endIcoMainSale.call();
    assert.equal(aNewDate, date);

    // reset to default
    await crowdsale.setEndIcoMainICO(defaultDate);
  });

  it("sets RATE for pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultRate = 2933;        
    const rate = defaultRate + 901; 
    assert.equal(await crowdsale.rateIcoPreICO.call(), defaultRate);
    await crowdsale.setRateIcoPreICO(rate);
    assert.equal(await crowdsale.rateIcoPreICO.call(), rate);

    // reset to default
    await crowdsale.setRateIcoPreICO(defaultRate);
  });

  it("sets RATE for main-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultRate = 2200;        
    const rate = defaultRate + 333; 
    assert.equal(await crowdsale.rateIcoMainSale.call(), defaultRate);
    await crowdsale.setRateIcoMainSale(rate);
    assert.equal(await crowdsale.rateIcoMainSale.call(), rate);
    // reset to default
    await crowdsale.setRateIcoMainSale(defaultRate);
  });

  it("keeps track of donator balances", async () => {
    //var crowdsale = await Crowdsale.deployed();
    const day = 60 * 60 * 24;

    //await increaseTimeTo(1530435600); // July 1st

    //console.log("block time "+latestTime());
    //console.log("block time "+new Date(latestTime()*1000));

    //await sale(firstAccount, { from: firstAccount, value: 5 * FINNEY, gas: 500000 });
   // await sale.procureTokens(secondAccount, { from: secondAccount, value: 15 * FINNEY, gas: 500000 });
   // await sale.procureTokens(secondAccount, { from: secondAccount, value: 3 * FINNEY, gas: 500000 });
   // assert.equal(await sale.balances.call(firstAccount), 5 * FINNEY);
   // assert.equal(await sale.balances.call(secondAccount), 18 * FINNEY);
    //assert.equal(await sale.balances.call(secondAccount), 17 * FINNEY);// fail test
  });

});