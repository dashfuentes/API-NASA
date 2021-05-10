"use strict";

let btn = document.querySelector(".fetch");

/**
 * This method attaches an event handler to the search button of our web application.
 * @param  {String} click "The first parameter is the type of event in this case click"
 * @param  {function} e "The second parameter is the function we want to call when the event occurs"
 */
btn.addEventListener("click", (e) => {
	e.preventDefault();
	let inputValue = document.querySelector("#latong").value;
	let date = document.querySelector("#date").value;
	const uri = location.origin + "/get-tiles";
	const coordinates = inputValue.split(",");
	const points = {
		date: date,
		lon: coordinates[0],
		lat: coordinates[1],
	};

	const tilesContainer = document.querySelector("#tiles");

	/**
	 * This function sends the object with the coordinates and the date to our endpoint to be processed
	 * @param  {String} url "Our endpoint URL"
	 * @returns {Object} response "Returns the URLs of our images"
	 */
	async function sendPoints(url = "") {
		while (tilesContainer.firstChild) {
			tilesContainer.removeChild(tilesContainer.firstChild);
		}
		tilesContainer.classList.add("loading");
		const response = await fetch(url, {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(points),
		});
		return response.json();
	}
	/**
	 * We execute this function to obtain the images and render them in our web page.
	 * @param  {String} uri "Our endpoint URl "
	 * @param  {Object} data "returns the URLs of our images"
	 */
	sendPoints(uri).then((data) => {
		tilesContainer.classList.remove("loading");
		data.map((t) => {
			let img = document.createElement("img");
			img.classList.add("quadrant");
			img.setAttribute("src", `./temp/slices/${t}?=${Date.now()}`);
			tilesContainer.appendChild(img);
		});
	});
});
