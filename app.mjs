import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import schedule from "node-schedule";
import fs from "fs-extra";
import youtubeChat from "youtube-chat";
import { parse } from "querystring";
import path from "path";

dotenv.config();

const apikey = process.env.api;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const app = express();
const PORT = process.env.PORT || 3001;

if (!YOUTUBE_API_KEY) {
  console.error("YOUTUBE_API_KEY is not set");
  process.exit(1);
}

console.log("Starting ValPilot");

console.log("api key: " + process.env.api);

app.get("/", (req, res) => {
  res.send("Welcome to the ValPilot");
});

app.get("/health", (req, res) => {
  res.send("ValPilot is Working totally fine!");
});

app.get("/valorant/rank/:region/:id/:tag", async (req, res) => {
  const { region, id, tag } = req.params;

  const mmrUrl = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${id}/${tag}?api_key=${apikey}`;

  try {
    const mmrData = await axios.get(mmrUrl);
    let responseMessage = " ";

    if (mmrData.status === 200) {
      const data = mmrData.data.data;
      const rank = data.currenttierpatched;
      const rr = data.ranking_in_tier;
      const lastMmrChange = data.mmr_change_to_last_game;
      responseMessage = `${rank} : ${rr}RR`;
    } else if (mmrData.status === 429) {
      responseMessage = `Error: Too Many Requests for Riot API!! Code: ${mmrData.status}`;
    } else {
      responseMessage = `Check your ID and Try Again!! Code: ${mmrData.status}`;
    }

    res.send(responseMessage);
  } catch (error) {
    res.send(`Error: ${error.message}`);
  }
});

app.get("/youtube/uptime", async (req, res) => {
  const { channelId } = req.query;

  if (!channelId) {
    return res.status(400).send("Missing channelId query parameter");
  }

  try {
    const channelUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);

    if (!channelResponse.ok) {
      const errorData = await channelResponse.json();
      console.error("YouTube API error:", errorData);
      throw new Error(`YouTube API error: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();

    if (channelData.items && channelData.items.length > 0) {
      const liveVideoId = channelData.items[0].id.videoId;
      const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveVideoId}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API error:", errorData);
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      if (
        data.items.length > 0 &&
        data.items[0].liveStreamingDetails &&
        data.items[0].liveStreamingDetails.actualStartTime
      ) {
        const startTime = new Date(
          data.items[0].liveStreamingDetails.actualStartTime
        );
        const now = new Date();
        const uptime = now - startTime;

        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);

        res.send(`Stream is running for ${hours} hrs ${minutes} min`);
      } else {
        res.send("Streamer is not live");
      }
    } else {
      res.send("Streamer is not live");
    }
  } catch (error) {
    console.error("Error fetching YouTube data:", error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Function to get YouTube channel statistics
const getChannelStats = async (channel, useID) => {
  let url;

  if (useID === "true") {
    url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channel}&key=${YOUTUBE_API_KEY}`;
  } else {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const channelId = searchData.items[0].id.channelId;
    url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return data.items[0].statistics.subscriberCount;
};

// Function to get YouTube channel data
const getChannelData = async (channel, useID) => {
  let url;

  if (useID === "true") {
    url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel}&key=${YOUTUBE_API_KEY}`;
  } else {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const channelId = searchData.items[0].id.channelId;
    url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  const channelName = data.items[0].snippet.title;
  const profileData = data.items[0].snippet.thumbnails.high.url;
  return { channelName, profileData };
};

// Endpoint to get YouTube channel statistics
app.get("/youtube/subscribers", async (req, res) => {
  const { channel, useID } = req.query;

  if (!channel || !useID) {
    return res.status(400).send("Missing channel or useID query parameter");
  }

  try {
    const stats = await getChannelStats(channel, useID);
    res.send(`Subscriber Count : ${stats}`);
  } catch (error) {
    console.error("Error fetching YouTube channel statistics:", error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
