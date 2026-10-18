import assert from "node:assert/strict";
import test from "node:test";
import { INVESTMENT_GAME, INVESTMENT_TEAMS, INVESTOR_TEAMS, INVESTORS, demoPortfolios, summarizePortfolios, validatePortfolio } from "../lib/investment-game.ts";

const investor = INVESTORS[0];
const outsideTeams = INVESTMENT_TEAMS.filter((team) => team.teamId !== investor.teamId);
const valid = { investorId: investor.id, allocations: { [outsideTeams[0].id]: 600_000, [outsideTeams[1].id]: 400_000 } };

test("all 99 accredited people belong to their original 33 teams", () => {
  assert.equal(INVESTOR_TEAMS.length, 33);
  assert.equal(INVESTMENT_TEAMS.length, 9);
  assert.equal(INVESTORS.length, 99);
  assert.equal(new Set(INVESTORS.map((person) => person.id)).size, 99);
  assert.equal(new Set(INVESTOR_TEAMS.map((team) => team.id)).size, 33);
  assert.ok(INVESTOR_TEAMS.every((team) => team.members.length === 3));
  assert.deepEqual(INVESTOR_TEAMS[0].members.map((person) => person.name), ["Rosario Stoppiello", "Martina Berrutti", "Romina Lubniski"]);
  assert.deepEqual(INVESTOR_TEAMS[32].members.map((person) => person.name), ["Ezequiel Garcia", "Juan Portas", "Rodrigo Portas"]);
  assert.ok(INVESTORS.some((person) => person.name === "Manuel Anselmi"));
  assert.ok(INVESTORS.some((person) => person.name === "Benjamin Macció"));
  assert.ok(INVESTORS.every((person) => INVESTOR_TEAMS.some((team) => team.id === person.teamId && team.members.some((member) => member.id === person.id))));
});

test("a complete portfolio is accepted with a server-generated timestamp", () => {
  const result = validatePortfolio({ ...valid, updatedAt: "forged" });
  assert.deepEqual(result.portfolio.allocations, valid.allocations);
  assert.notEqual(result.portfolio.updatedAt, "forged");
});

test("all members of the nine confirmed finalists are blocked from investing in their own team", () => {
  let blocked = 0;
  for (const finalist of INVESTMENT_TEAMS) {
    const outsideTeam = INVESTMENT_TEAMS.find((team) => team.id !== finalist.id);
    for (const person of INVESTORS.filter((person) => person.teamId === finalist.teamId)) {
      assert.match(validatePortfolio({ investorId: person.id, allocations: { [finalist.id]: 1_000_000 } }).error, /propio equipo/);
      assert.match(validatePortfolio({ investorId: person.id, allocations: { [finalist.id]: 25_000, [outsideTeam.id]: 975_000 } }).error, /propio equipo/);
      blocked++;
    }
  }
  assert.equal(blocked, 27);
});

test("under-budget and over-budget portfolios are both rejected", () => {
  for (const amount of [0, 25_000, 975_000, 1_025_000, 2_000_000]) {
    assert.ok(validatePortfolio({ investorId: investor.id, allocations: { [outsideTeams[0].id]: amount } }).error);
  }
});

test("invalid amounts, unknown teams and unknown voters are rejected", () => {
  for (const amount of [-25_000, 1.5, 1_000_001, NaN, Infinity, "1000000", null]) {
    assert.ok(validatePortfolio({ investorId: investor.id, allocations: { [outsideTeams[0].id]: amount } }).error);
  }
  assert.ok(validatePortfolio({ ...valid, investorId: "someone-else" }).error);
  assert.ok(validatePortfolio({ ...valid, allocations: { unknown: 1_000_000 } }).error);
  for (const body of [null, [], {}, "invalid", { investorId: investor.id, allocations: [] }]) assert.ok(validatePortfolio(body).error);
});

test("empty amounts are removed and a single outside team is allowed", () => {
  const result = validatePortfolio({ investorId: investor.id, allocations: { [outsideTeams[0].id]: 1_000_000, [outsideTeams[1].id]: 0 } });
  assert.deepEqual(result.portfolio.allocations, { [outsideTeams[0].id]: 1_000_000 });
});

test("importing real people does not create fictional investments in their names", () => {
  const portfolios = demoPortfolios();
  assert.deepEqual(portfolios, []);
  for (const portfolio of portfolios) assert.ok(validatePortfolio(portfolio).portfolio);
  const results = summarizePortfolios(portfolios);
  assert.equal(results.total, portfolios.length * INVESTMENT_GAME.budget);
  assert.equal(results.teams.reduce((sum, team) => sum + team.amount, 0), results.total);
  assert.equal(results.submitted, portfolios.length);
  assert.ok(results.teams.every((team, i, teams) => i === 0 || teams[i - 1].amount >= team.amount));
});

test("each of the 99 people can save an individual million-dollar portfolio", () => {
  const portfolios = INVESTORS.map((person) => {
    const recipient = INVESTMENT_TEAMS.find((team) => team.teamId !== person.teamId);
    const result = validatePortfolio({ investorId: person.id, allocations: { [recipient.id]: INVESTMENT_GAME.budget } });
    assert.ok(result.portfolio, person.name);
    return result.portfolio;
  });
  const results = summarizePortfolios(portfolios);
  assert.equal(results.submitted, 99);
  assert.equal(results.participants, 99);
  assert.equal(results.total, 99_000_000);
  assert.equal(results.teams.reduce((sum, team) => sum + team.amount, 0), 99_000_000);
});

test("an empty round shows all teams with zero capital", () => {
  const results = summarizePortfolios([]);
  assert.equal(results.teams.length, 9);
  assert.equal(results.total, 0);
  assert.equal(results.submitted, 0);
  assert.ok(results.teams.every((team) => team.amount === 0 && team.investors === 0));
});
