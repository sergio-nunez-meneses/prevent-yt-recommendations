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
	for (let mutation of mutationsList) {
		if (mutation.type === "childList") {
			if (mutation.target.tagName.toLowerCase() === "ytd-two-column-browse-results-renderer" // Video recommendations on "/"
					|| mutation.target.tagName.toLowerCase() === "ytd-rich-grid-renderer"
					|| mutation.target.tagName.toLowerCase() === "yt-related-chip-cloud-renderer" // Recommendation filters on logged in
					|| mutation.target.id === "sections") { // Comments on "/watch"
				mutation.target.remove();
			}
			// TODO: Doesn't work
			// Video pause overlay on "/watch"
			if (mutation.target.tagName.toLowerCase() === "tp-yt-iron-overlay-backdrop") {
				console.log(mutation.target, document.getElementById("confirm-button"));
				document.getElementById("confirm-button").click();
			}
			// related videos' list on "/watch"
			if (mutation.target.firstElementChild.tagName.toLowerCase() === "ytd-compact-video-renderer") {
				relatedVideosContainer = mutation.target;

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
			if (mutation.target.ended) { // Video stream ended
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
	if (!shuffleButton) {
		let secondColumn = document.getElementById("secondary");
		let button       = document.createElement("button");
		button.className = "shuffle-button";
		button.innerText = "Shuffle";

		secondColumn.insertBefore(button, secondColumn.firstElementChild);

		button.onclick = shuffleRelatedVideosList;
		shuffleButton  = button;
	}
}

// ============================================================================
// Code to execute
// ============================================================================
if (window.location.hostname.includes("youtube")) {
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
