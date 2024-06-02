require("dotenv").config();

async function getUptime(channelId) {
    const fetch = (await import("node-fetch")).default;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const channelUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;

    try {
        const channelResponse = await fetch(channelUrl);

        if (!channelResponse.ok) {
            const errorData = await channelResponse.json();
            console.error("YouTube API error in getUptime:", errorData);
            throw new Error(`YouTube API error: ${channelResponse.statusText}`);
        }

        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
            const liveVideoId = channelData.items[0].id.videoId;
            const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveVideoId}&key=${YOUTUBE_API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("YouTube API error in getUptime:", errorData);
                throw new Error(`YouTube API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.items.length > 0 && data.items[0].liveStreamingDetails && data.items[0].liveStreamingDetails.actualStartTime) {
                const startTime = new Date(data.items[0].liveStreamingDetails.actualStartTime);
                const now = new Date();
                const uptime = now - startTime;

                const hours = Math.floor(uptime / 3600000);
                const minutes = Math.floor((uptime % 3600000) / 60000);

                return `Stream is running for ${hours} hrs ${minutes} min`;
            } else {
                return "Streamer is not live";
            }
        } else {
            return "Streamer is not live";
        }
    } catch (error) {
        console.error("Error in getUptime:", error.response ? error.response.data : error.message);
        throw new Error(`Error fetching YouTube data: ${error.message}`);
    }
}

async function getChannelStats(channel, useID) {
    const fetch = (await import("node-fetch")).default;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
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

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items[0].statistics.subscriberCount;
    } catch (error) {
        console.error("Error in getChannelStats:", error.response ? error.response.data : error.message);
        throw new Error(`Error fetching YouTube data: ${error.response ? error.response.status : error.message}`);
    }
}

async function getChannelData(channel, useID) {
    const fetch = (await import("node-fetch")).default;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
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

    try {
        const response = await fetch(url);
        const data = await response.json();
        const channelName = data.items[0].snippet.title;
        const profileData = data.items[0].snippet.thumbnails.high.url;
        return { channelName, profileData };
    } catch (error) {
        console.error("Error in getChannelData:", error.response ? error.response.data : error.message);
        throw new Error(`Error fetching YouTube data: ${error.response ? error.response.status : error.message}`);
    }
}

module.exports = { getUptime, getChannelStats, getChannelData };
