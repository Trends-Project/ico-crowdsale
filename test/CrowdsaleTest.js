// test/FundingTest.js
const Crowdsale = artifacts.require("Crowdsale");

contract("Crowdsale", accounts => {
  const [firstAccount] = accounts;

  it("sets an owner", async () => {
    const sale = await Crowdsale.new();
    assert.equal(await sale.owner.call(), firstAccount);
  });
});