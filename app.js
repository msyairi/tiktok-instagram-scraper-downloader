

//  --- CREDIT
/*  by Moh. Syairi
    Github : https://github.com/msyairi
    Don't remove credit.
*/


const express = require('express');
const fetch = require("node-fetch");
const axios = require("axios");
const path = require('path');
const fs = require ('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

// --- SCRAPING INSTAGRAM
const getIdIG = (url) => {
	const matching = url.includes("instagram.com");

	if (!matching) {
		console.log("[X] Error: URL not found");
		exit();
	}

	return url.slice(31, 42);
}

app.post('/download/instagram/', async function (req, res) {
	const getUrl = req.body.url;

	try {
	    const idIG = getIdIG(getUrl);
	    const url = `https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_id?response_type=reels&corsEnabled=true&shortcode=${idIG}`;
	    
	    const resIG = await axios.get(url, {
	        headers: {
				'origin': 'https://kecav.github.io',
				'sec-ch-ua-platform': 'Windows',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
				'x-rapidapi-host': 'instagram-bulk-profile-scrapper.p.rapidapi.com',
				'x-rapidapi-key': 'ef60724516mshe06808ae9cf170ap1e9908jsn36a5638bc979'
	        }
	    });

	    if (resIG.data[0].status === 'ok') {
			const idVideo = resIG.data[0].items[0].id;
			const author = resIG.data[0].items[0].user.username;
			const image = resIG.data[0].items[0].image_versions2.candidates[0].url_original;
			const urlMedia = resIG.data[0].items[0].video_versions[0].url_original;

			const dtFetch = {
				'id' : idVideo,
				'user' : author,
				'image' : image,
				'video' : urlMedia,
			}

			if (urlMedia !== undefined) {
				if (idVideo !== '' || idVideo !== undefined) {
					axios({
						method: 'get',
						url: urlMedia,
						responseType: 'stream'
					})
					.then(function (response) {
						return new Promise((resolve, reject) => {
							const filename = `IG-${idVideo}.mp4`;
							const file = fs.createWriteStream(`downloads/IG-${idVideo}.mp4`);
							response.data.pipe(file);

							file.on("error", (error) => {
								return reject(`There was an error writing the file. Details: ${error}`);
							});

							file.on('finish', () => {
								file.close();
							});

							file.on('close', () => {
								return resolve(filename);
							});
						});
					})
					.catch(function (error) {
						res.status(201).json ({
							code : 201,
							message : 'Error : ' + error
						})
					})
					.then(async function (filename) {
						res.status(200).json ({
							code : 200,
							message : 'OK',
							path : 'downloads/' + filename,
							data : dtFetch
						})
					})
				}
				else {
					res.status(201).json ({
						code : 201,
						message : 'ID Video Undefined'
					})
				}
			} 
			else {
				res.status(201).json ({
					code : 201,
					message : 'URL Video Undefined'
				})
			}
	    }
	    else {
	    	res.status(201).json ({
				code : 201,
				message : 'Error : ' + resIG.data[0].status
			})
	    }
	} 
	catch (error) {
		res.status(201).json ({
			code : 201,
			message : 'Error : ' + error
		})
	}
});

// --- SCRAPING TIKTOK
const getRedirectUrlTiktok = async (url) => {
	if(url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
		url = await fetch(url, {
			redirect: "follow",
			follow: 10,
		});

		url = url.url;
	}

	return url;
}

const getIdTiktok = (url) => {
	const matching = url.includes("/video/");

	if (!matching) {
		console.log("[X] Error: URL not found");
		exit();
	}

	const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);

	return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}

app.post('/download/tiktok/', async function (req, res) {
	const getUrl = req.body.url;

	try {
	    const urlRedirect = await getRedirectUrlTiktok(getUrl);
	    const idVideo = await getIdTiktok(urlRedirect);

	    const url_fetch = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;

	    const html_fetch = await axios.get(url_fetch);

	    if (html_fetch.status === 200) {
			const urlMedia = html_fetch.data.aweme_list[0].video.download_addr.url_list[0];
			const author = html_fetch.data.aweme_list[0].author.unique_id;

			const dtFetch = {
				'id' : idVideo,
				'author' : author,
				'video' : urlMedia,
			}

			if (urlMedia !== undefined) {
				if (idVideo !== '' || idVideo !== undefined) {
					axios({
						method: 'get',
						url: urlMedia,
						responseType: 'stream'
					})
					.then(function (response) {
						return new Promise((resolve, reject) => {
							const filename = `TT-${idVideo}.mp4`;
							const file = fs.createWriteStream(`downloads/TT-${idVideo}.mp4`);
							response.data.pipe(file);

							file.on("error", (error) => {
								return reject(`There was an error writing the file. Details: ${error}`);
							});

							file.on('finish', () => {
								file.close();
							});

							file.on('close', () => {
								return resolve(filename);
							});
						});
					})
					.catch(function (error) {
						res.status(201).json ({
							code : 201,
							message : 'Error : ' + error
						})
					})
					.then(async function (filename) {
						res.status(200).json ({
							code : 200,
							message : 'OK',
							path : 'downloads/' + filename,
							data : dtFetch
						})
					})
				}
				else {
					res.status(201).json ({
						code : 201,
						message : 'ID Video Undefined'
					})
				}
			} 
			else {
				res.status(201).json ({
					code : 201,
					message : 'URL Video Undefined'
				})
			}
		}
		else {
			res.status(201).json ({
				code : 201,
				message : 'Error : ' + html_fetch.status
			})
		}
	} 
	catch (err) {
		res.status(201).json ({
			code : 201,
			message : 'Error : ' + error
		})
	}
});

app.listen(3900);