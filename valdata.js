const axios = require("axios");
require("dotenv").config();

const apikey = process.env.api;

async function calcHs(region, id, tag) {
  const url = `https://api.henrikdev.xyz/valorant/v1/lifetime/matches/${region}/${id}/${tag}?api_key=${apikey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.data;

    if (!data || !data[0]) {
      throw new Error("No data available");
    }

    const { head, body, leg } = data[0].stats.shots;
    const totalShots = head + body + leg;
    const headshotPercentage = totalShots > 0 ? (head / totalShots) * 100 : 0;

    return `Overall HS Rate of ${id}#${tag} is ${headshotPercentage.toFixed(
      1
    )}%`;
  } catch (error) {
    console.error(
      "Error in calcHs:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      `Error fetching data: ${
        error.response ? error.response.status : error.message
      }`
    );
  }
}

async function getMMR(region, id, tag) {
  const url = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${id}/${tag}?api_key=${apikey}`;
  try {
    const response = await axios.get(url);
    return response.data.data.elo;
  } catch (error) {
    console.error(
      "Error in getMMR:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      `Error fetching data: ${
        error.response ? error.response.status : error.message
      }`
    );
  }
}

async function getRank(region, id, tag) {
  const url = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${id}/${tag}?api_key=${apikey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.data;

    if (response.status === 200) {
      const rank = data.currenttierpatched;
      const rr = data.ranking_in_tier;
      return `${rank} : ${rr}RR`;
    } else if (response.status === 429) {
      throw new Error(
        `Too Many Requests for Riot API! Code: ${response.status}`
      );
    } else {
      throw new Error(`Check your ID and Try Again! Code: ${response.status}`);
    }
  } catch (error) {
    console.error(
      "Error in getRank:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      `Error fetching data: ${
        error.response ? error.response.status : error.message
      }`
    );
  }
}

module.exports = { calcHs, getMMR, getRank };
