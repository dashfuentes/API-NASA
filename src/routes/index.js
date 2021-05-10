const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const fetch = require("node-fetch");
const imageToSlices = require("image-to-slices");

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

	const url = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&dim=0.50&api_key=gNVY3OiQQekxdGav8oAVNkRgzbuLPEb5ylmspu34`;

	/**
	 * This function makes the crop in 9 portions of the image obtained from the Nasa API
	 * This function was created with the image-to-slices module
	 *  @returns {Object} files "returns the URLs of our images"
	 */
	const slices = () => {
		let lineXArray = [682, 1364];
		let lineYArray = [682, 1364];
		let source = "./src/public/temp/source/main.jpg";

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
	const download = async () => {
		const response = await fetch(url);
		const buffer = await response.buffer();
		fs.promises
			.writeFile(`./src/public/temp/source/main.jpg`, buffer)
			.then(() => {
				// Do whatever you want to do.
				slices();
			});
	};

	/**
	 * This instruction executes the main function of this file
	 */
	download();
});

module.exports = router;
