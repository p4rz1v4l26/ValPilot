const express = require("express");
const dotenv = require("dotenv");
const valdata = require("./valdata");
const ytdata = require("./ytdata");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log("Starting ValPilot");

app.get("/", (req, res) => {
    res.send("Welcome to the ValPilot");
});

app.get("/health", (req, res) => {
    res.send("ValPilot is working totally fine!");
});

app.get("/val/rank/:region/:id/:tag", async (req, res) => {
    const { region, id, tag } = req.params;

    try {
        const rank = await valdata.getRank(region, id, tag);
        res.send(rank);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.get("/val/hs/:region/:id/:tag", async (req, res) => {
    const { region, id, tag } = req.params;
    const fs = req.query.fs;

    try {
        const hs = await valdata.calcHs(region, id, tag);
        if (fs === "json") {
            res.json({ hs });
        } else {
            res.send(hs.toString());
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/val/mmr/:region/:id/:tag", async (req, res) => {
    const { region, id, tag } = req.params;
    const fs = req.query.fs;

    try {
        const mmr = await valdata.getMMR(region, id, tag);
        const responseMessage = `Current MMR Rating of ${id}#${tag} is : ${mmr}`;

        if (fs === "json") {
            res.json({ MMR: mmr });
        } else {
            res.send(responseMessage);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/yt/uptime", async (req, res) => {
    const { channelId } = req.query;

    if (!channelId) {
        return res.status(400).send("Missing channelId query parameter");
    }

    try {
        const uptime = await ytdata.getUptime(channelId);
        res.send(uptime);
    } catch (error) {
        console.error("Error fetching YouTube data:", error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.get("/yt/subscribers", async (req, res) => {
    const { channel, useID } = req.query;

    if (!channel || !useID) {
        return res.status(400).send("Missing channel or useID query parameter");
    }

    try {
        const stats = await ytdata.getChannelStats(channel, useID);
        res.send(`Subscriber Count: ${stats}`);
    } catch (error) {
        console.error("Error fetching YouTube channel statistics:", error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
