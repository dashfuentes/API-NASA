const express = require("express");
const path = require("path");
const router = express.Router();
var fs = require('fs'),
    request = require('request');
const fetch = require("node-fetch");
const imageToSlices = require("image-to-slices");
const axios = require('axios');

router.get("/", (req, res) => {
	res.render("layouts/main");
});
/**
 * This route is the main endpoint of our application and waits for POST requests
 * @param  {String} /get-tiles "Endpoint address"
 * @param  {Object} "req" "request Node object"
 * @param  {Object} "res" "response Node object"
 */
router.post("/get-tiles", (req, res) => {
	const { lon, lat } = req.body;
	const todayDate = new Date().toISOString().slice(0, 10);
	const date = req.body.date ? req.body.date : todayDate;

	const uri = `https://api.nasa.gov/planetary/earth/assets?lon=${lon}&lat=${lat}&date=${date}&dim=0.50&api_key=gNVY3OiQQekxdGav8oAVNkRgzbuLPEb5ylmspu34`;
console.log(uri)
	/**
	 * This function makes the crop in 9 portions of the image obtained from the Nasa API
	 * This function was created with the image-to-slices module
	 *  @returns {Object} files "returns the URLs of our images"
	 */
	const slices = () => {
		let lineXArray = [682, 1364];
		let lineYArray = [682, 1364];
		let source = "./src/public/temp/source/main.png";

		imageToSlices(
			source,
			lineXArray,
			lineYArray,
			{
				saveToDir: "./src/public/temp/slices",
				clipperOptions: {
					canvas: require("canvas"),
				},
			},
			function () {
				fs.readdir("./src/public/temp/slices/", function (err, files) {
					const images = files.filter((el) => el !== ".gitignore");
					if (err) {
						onError(err);
						return;
					}
					res.send(images);
				});
			}
		);
	};

	/**
	 * This function makes the request to the NASA API to download the image and then we chain the image cropping function
	 */
	const download =  () => {
		axios
		.get(uri)
		.then(res => {
			var data = res.data;
			var imgURL = data.url;
			console.log(imgURL)
			return imgURL
		  
		}).then(response => {
			console.log('another fn', response)
			//execute the download fn
		return	downloadImg(response, './src/public/temp/source/main.png', function(){
			console.log('ready to cut');
			slices()
	     	})
		})
		.catch(error => {
		  console.error(error);
		});
	  
	
	};


	

var downloadImg = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

	/**
	 * This instruction executes the main function of this file
	 */
	download();
});

module.exports = router;
