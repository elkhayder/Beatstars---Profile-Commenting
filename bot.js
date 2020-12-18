const fetch = require("node-fetch"); // fetch
const fs = require("fs");
const withQuery = require("with-query").default;
require("dotenv").config(); // env
const chalk = require("chalk");
const terminalLink = require("terminal-link");

const MessagesList = [
   "Fire bro, keep it going",
   "Damn, that is hitting hard",
   "Holly ...",
   "Damn, that is so unique",
   "Proud of ya...",
];

const getTracksList = (pointer = 1, limit = 14) => {
   return new Promise((resolve, reject) => {
      fetch(
         withQuery("https://main.v2.beatstars.com/tracks", {
            list_type: "top-sellers",
            track_fields: "details",
            track_type: "all_beats",
            genre: "hip-hop",
            list_pointer: pointer,
            list_limit: limit,
            sort: "top-sellers",
         })
      )
         .then((request) => request.json())
         .then((response) => resolve(response.response.data.list))
         .catch((error) => reject(error));
   });
};

const parseMusicians = (dataList) => {
   return dataList.map(({ details }) => {
      return {
         id: details.musician.user_id,
         name: details.musician.display_name,
         uri: details.musician.beatstars_uri,
      };
   });
};

const commentOnProfile = ({ id, name, uri }, commentString) => {
   return new Promise((resolve, reject) => {
      fetch(
         withQuery("https://main.v2.beatstars.com/comments/profile", {
            id,
         }),
         {
            method: "POST",
            headers: { authorization: `Bearer ${process.env.BEATSTARS_TOKEN}` },
            body: JSON.stringify({
               id,
               data: commentString,
               type: "profile",
            }),
         }
      )
         .then((request) => request.json())
         .then((response) => {
            console.log(
               // Log that comment successfully added
               chalk.green(`Commented`),
               chalk.black(commentString),
               chalk.underline.green(`on ${name}'s Profile. [${uri}]`)
            );
            resolve(response);
         })
         .catch((error) => reject(error));
   });
};

var tracksPointer = 1;

const App = async () => {
   const tracks = await getTracksList(tracksPointer);
   tracksPointer += 14; // Increment Tracks pointer
   const musicians = parseMusicians(tracks);

   for (i = 0; i < musicians.length; i++) {
      const selectedMessage =
         MessagesList[
            Math.floor(Math.random() * Math.random() * MessagesList.length)
         ];

      const messageCommentRequest = await commentOnProfile(
         musicians[i],
         selectedMessage
      );
   }

   App();
};

App();
