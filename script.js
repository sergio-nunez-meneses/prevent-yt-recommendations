// ============================================================================
//  Variables
// ============================================================================
const observerConfig  = {attributes: true, childList: true, subtree: true};
let app               = document.getElementsByTagName("ytd-app")[0];
let isShuffled        = false;
let shuffleButton;
// let newFirstVideoLink = "";

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
			if (mutation.target.tagName.toLowerCase() === "ytd-rich-grid-renderer") {
				mutation.target.remove();
			}
		}
		else if (mutation.target.tagName.toLowerCase() === "ytd-watch-flexy" &&
				mutation.type === "attributes" && mutation.attributeName === "hidden") {
			if (mutation.target.hasAttribute("hidden")) {
				console.log("App is hidden");

				if (shuffleButton) {
					shuffleButton.remove();
				}
			}
			else {
				console.log("App is not hidden");

				let relatedContainer = document.getElementById("related");
				shuffleButton        = createShuffleButton(relatedContainer);
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

// function loadMoreRelatedVideos(relatedVideos) {
// 	let totalRelatedVideos = relatedVideos.length;
// 	let loadMoreButton     = relatedVideos[totalRelatedVideos - 1].children["button"];
//
// 	if (loadMoreButton) {
// 		loadMoreButton.removeAttribute("hidden");
// 		loadMoreButton.firstElementChild.firstElementChild.click();
// 	}
// }
//
// function setNewFirstVideo(relatedVideosContainer, newFirstVideo, beforeVideoElement) {
// 	let excludeElement = "ytd-continuation-item-renderer";
//
// 	if (newFirstVideo.tagName.toLowerCase() !== excludeElement
// 			&& beforeVideoElement.tagName.toLowerCase() !== excludeElement) {
// 		relatedVideosContainer.insertBefore(newFirstVideo, beforeVideoElement);
//
// 		newFirstVideoLink = newFirstVideo.children[0].children[0].children[0].href;
// 	}
// }
//
// function shuffleRelatedVideosList(relatedVideosContainer) {
// 	let relatedVideos      = relatedVideosContainer.children;
// 	let totalRelatedVideos = relatedVideos.length;
//
// 	for (let i = 0; i < totalRelatedVideos; i++) {
// 		let randId              = Math.floor(Math.random() * totalRelatedVideos);
// 		let temporaryFirstVideo = relatedVideosContainer.firstChild;
// 		let newFirstVideo       = relatedVideos[randId];
//
// 		setNewFirstVideo(relatedVideosContainer, newFirstVideo, temporaryFirstVideo);
// 	}
// }

function redirectToNewFirstVideo(mutationList, videoStreamObserver) {
	for (let mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === "style") {
			if (mutation.target.ended) {
				// window.location.href = newFirstVideoLink;
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

function createShuffleButton(relatedContainer) {
	let button       = document.createElement("button");
	button.className = "shuffle-button";
	button.innerText = "Shuffle";

	relatedContainer.insertBefore(button, relatedContainer.firstElementChild);

	return button;
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
// 		let shuffleButton          = createShuffleButton(relatedContainer);
// 		let dragStart              = false; // prevent triggering event multiple times
// 		let newFirstVideo;
//
// 		shuffleButton.addEventListener("click", function() {
// 			setCurrentVideoObserver();
// 			loadMoreRelatedVideos(relatedVideos);
// 			shuffleRelatedVideosList(relatedVideosContainer);
// 		});
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
