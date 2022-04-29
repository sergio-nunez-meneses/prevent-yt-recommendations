// ============================================================================
//  Variables
// ============================================================================
const observerConfig = {attributes: true, childList: true, subtree: true};
let app              = document.getElementsByTagName("ytd-app")[0];
let isShuffled       = false;
let newFirstVideoUrl = "";
let shuffleButton, relatedVideosContainer;

// ============================================================================
// Functions
// ============================================================================
function init() {
	let appObserver = new MutationObserver(checkCurrentAppPath);
	appObserver.observe(app, observerConfig);
}

function checkCurrentAppPath(mutationsList, appObserver) {
	// TODO: Refactor
	for (let mutation of mutationsList) {
		if (mutation.type === "childList") {
			// video recommendations on "/"
			if (mutation.target.tagName.toLowerCase() === "ytd-rich-grid-renderer") {
				mutation.target.remove();
			}
			// recommendation filters when logged in
			else if (mutation.target.tagName.toLowerCase() === "yt-related-chip-cloud-renderer") {
				mutation.target.remove();
			}
			// comments on "/watch"
			else if (mutation.target.id === "sections") {
				mutation.target.remove();
			}
			// related videos' list on "/watch"
			if (mutation.target.id === "contents"
					&& mutation.target.className === "style-scope ytd-item-section-renderer") {
				relatedVideosContainer = mutation.target;
			}
			else if (mutation.target.id === "items"
					&& mutation.target.className === "style-scope ytd-watch-next-secondary-results-renderer") {
				relatedVideosContainer = mutation.target;
			}
		}
		else if (mutation.target.tagName.toLowerCase() === "ytd-watch-flexy" &&
				mutation.type === "attributes" && mutation.attributeName === "hidden") {
			if (mutation.target.hasAttribute("hidden")) {
				console.log("App is hidden");
			}
			else {
				console.log("App is not hidden");

				createShuffleButton();
			}
		}
	}
}

function setCurrentVideoObserver() {
	if (!isShuffled) {
		let videoStreamObserver = new MutationObserver(redirectToNewFirstVideo);
		videoStreamObserver.observe(document.getElementsByTagName("video")[0], observerConfig);
	}
	isShuffled = true;
}

function loadMoreRelatedVideos() {
	let relatedVideos  = relatedVideosContainer.children;
	let loadMoreButton = relatedVideos[relatedVideos.length - 1].children["button"];

	if (loadMoreButton) {
		loadMoreButton.removeAttribute("hidden");
		loadMoreButton.firstElementChild.firstElementChild.click();
	}
}

function shuffleRelatedVideosList() {
	setCurrentVideoObserver();
	loadMoreRelatedVideos();

	let relatedVideos      = relatedVideosContainer.children;
	let totalRelatedVideos = relatedVideos.length;

	for (let i = 0; i < totalRelatedVideos; i++) {
		let randId        = Math.floor(Math.random() * totalRelatedVideos);
		let firstVideo    = relatedVideosContainer.firstChild;
		let newFirstVideo = relatedVideos[randId];

		setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo);
	}
}

function setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo) {
	let loadMoreSpinnerTagName = "ytd-continuation-item-renderer";

	if (newFirstVideo.tagName.toLowerCase() !== loadMoreSpinnerTagName
			&& firstVideo.tagName.toLowerCase() !== loadMoreSpinnerTagName) {
		relatedVideosContainer.insertBefore(newFirstVideo, firstVideo);

		newFirstVideoUrl = newFirstVideo.children[0].children[0].children[0].href;
	}
}

function redirectToNewFirstVideo(mutationList, videoStreamObserver) {
	for (let mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === "style") {
			if (mutation.target.ended) {
				window.location.href = newFirstVideoUrl;
			}
		}
	}
}

function setShuffleButtonCss() {
	let css       = document.createElement("style");
	css.innerHTML = `
	.shuffle-button {
		margin: 0 0 1rem 0;
		border: none;
		border-radius: 2px;
		padding: 1rem;
		width: 100%;
		background-color: #c00;
		font-family: inherit;
		text-transform: uppercase;
		font-weight: bold;
		color: white;
	}`;
	document.getElementsByTagName('head')[0].appendChild(css);
}

function createShuffleButton() {
	let relatedContainer = document.getElementById("related");
	let button           = document.createElement("button");
	button.className     = "shuffle-button";
	button.innerText     = "Shuffle";

	relatedContainer.insertBefore(button, relatedContainer.firstElementChild);

	button.onclick = shuffleRelatedVideosList;
	shuffleButton  = button;
}

// ============================================================================
// Code to execute
// ============================================================================
if (window.location.hostname.includes("youtube")) {
	console.log(window.location.pathname); // TODO: init() based also on pathname

	init();
	setShuffleButtonCss();
}

// 	else if (window.location.pathname === "/watch") {
// 		const closestParentTagName = ".ytd-watch-next-secondary-results-renderer";
// 		let relatedContainer       = document.getElementById("related");
// 		let relatedVideosContainer = relatedContainer.children[1].children["items"];
// 		let relatedVideos          = relatedVideosContainer.children;
// 		let dragStart              = false; // prevent triggering event multiple times
// 		let newFirstVideo;
//
// 		for (const relatedVideo of relatedVideos) {
// 			relatedVideo.addEventListener("drag", function(e) {
// 				if (!dragStart) {
// 					newFirstVideo = e.target.closest(closestParentTagName);
// 				}
// 				dragStart = true;
// 			});
// 			relatedVideo.addEventListener("dragover", function(e) {
// 				e.preventDefault(); // prevent default to allow drop
// 			});
// 			relatedVideo.addEventListener("drop", function(e) {
// 				e.preventDefault(); // prevent default action (open as link for some elements)
//
// 				if (dragStart) {
// 					let firstVideo = e.target.closest(closestParentTagName);
//
// 					setCurrentVideoObserver();
// 					loadMoreRelatedVideos(relatedVideos);
// 					setNewFirstVideo(relatedVideosContainer, newFirstVideo, firstVideo);
// 				}
// 				dragStart = false;
// 			});
// 		}
// 	}
// }

// ============================================================================
// EventListeners
// ============================================================================
