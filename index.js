const fetch = require("node-fetch"); // fetch
const fs = require("fs");
const withQuery = require("with-query").default;
require("dotenv").config(); // env

const logFileName = "log.txt";

const API_ENDPOINTS = {
   tracksList: "https://main.v2.beatstars.com/tracks",
   commentTrack: "https://main.v2.beatstars.com/comments/track",
   commentProfile: "https://main.v2.beatstars.com/comments/profile",
};

const commentsList = [
   "Fire bro, keep it going",
   "Damn, that is hitting hard",
   "Holly ...",
   "Damn, that is so unique",
   "Proud of ya...",
];

const extractMusicians = (list) => {
   let musicians = [];
   list.forEach((track) => {
      const musicianId = track.details.musician.user_id;
      musicians.push(musicianId);
   });
   return musicians;
};

var alreadyCommentedProfiles = [];

const getTracks = async () => {
   return new Promise((resolve, reject) => {
      fetch(
         withQuery(API_ENDPOINTS.tracksList, {
            list_type: "top-sellers",
            track_fields: [
               "details",
               //   "licenses",
               //   "stats"
            ].join(","),
            track_type: "all",
            sort: "top-sellers",
            list_limit: 20,
         }),
         {
            method: "GET",
         }
      )
         .then((request) => request.json())
         .then((response) => response.response.data.list)
         .then((tracksList) => extractMusicians(tracksList))
         .then((musicians) => resolve(musicians))
         .catch((err) => reject(err));
   });
};

const commentProfile = (profileId, comment) => {
   return new Promise((resolve, reject) => {
      fetch(
         withQuery(API_ENDPOINTS.commentProfile, {
            id: profileId,
         }),
         {
            method: "POST",
            headers: { authorization: `Bearer ${process.env.BEATSTARS_TOKEN}` },
            body: JSON.stringify({
               data: comment,
               id: profileId,
               type: "profile",
            }),
         }
      )
         .then((request) => {
            alreadyCommentedProfiles.push(profileId);
            fs.writeFile(
               logFileName,
               JSON.stringify(alreadyCommentedProfiles),
               (err) => {
                  if (err) console.log(err);
               }
            );
            return request.json();
         })
         .then((response) => resolve(response))
         .catch((err) => reject(err));
   });
};

const commentProfilesList = (musiciansList) => {
   return new Promise(async (resolve, reject) => {
      for (let i = 0; i < musiciansList.length; i++) {
         let comment =
            commentsList[Math.floor(Math.random() * commentsList.length)];
         const b = await commentProfile(musiciansList[i], comment);
         if (index === musiciansList.length - 1) resolve();
      }
   });
};

const app = () => {
   (async function () {
      console.log("hey");
      const musiciansList = await getTracks();
      console.log("Got new List");
      for (let i = 0; i < musiciansList.length; i++) {
         let comment =
            commentsList[Math.floor(Math.random() * commentsList.length)];
         const b = await commentProfile(musiciansList[i], comment);
         console.log("commented");
         //   if (i === musiciansList.length - 1) resolve();
      }
      app();
   })();
};

app();
