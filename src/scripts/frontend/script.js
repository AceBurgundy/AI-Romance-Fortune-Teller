import { generatePrediction } from "./predictions.js";
import { spawnHeart } from "./spawn-hearts.js";

const video = document.getElementById("camera");
const cameraBox = document.getElementById("content-camera");

let stopActions = true;
let detectedFaces = 0;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('scripts/frontend/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('scripts/frontend/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('scripts/frontend/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('scripts/frontend/models')
])
.then(() => {
  stopActions = false;

  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    error => console.error(error)
  )
});

video.onplay = event => {
  const canvas = faceapi.createCanvasFromMedia(video)
  cameraBox.append(canvas)

  const size = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, size)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video, 
      new faceapi.TinyFaceDetectorOptions()
    )
      .withFaceLandmarks()
      .withFaceExpressions()

    const resizedDetections = faceapi.resizeResults(detections, size)
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Set custom color for bounding box
    const drawOptions = {
      label: '',
      boxColor: 'red', // Change this to your desired color
      lineWidth: 5
    }

    resizedDetections.forEach(det => {
      const box = det.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
      drawBox.draw(canvas)
    })

    detectedFaces = resizedDetections.length;
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
}

const start = document.getElementById("start-button");
const predictingPopup = document.getElementById("predicting-popup");
const predictingPopupText = document.getElementById("predicting-popup-text");

let predicting = false;

start.onclick = async event => {
  if (stopActions) return;

  stopActions = true;
  predicting = true;
  predictingPopup.classList.add("show");

  let countdown = 5;

  const interval = setInterval(() => {
    predictingPopupText.textContent = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      predict(); // Call predict() when countdown reaches 0
    }
  }, 1000);
};

// Spawn hearts only if stopActions is true
setInterval(() => {
  if (predicting) spawnHeart()
}, 100);

function predict() {
  // check number of people in the camera
  if (detectedFaces <= 0) {
    document.getElementById("prediction").textContent = "No face detected";
    predicting = false;
    stopActions = false;
    return;
  }

  // stop hearts
  predicting = false;
  predictingPopup.classList.remove("show")
  predictingPopupText.textContent = "Predicting";

  const predicted = generatePrediction(detectedFaces)
  document.getElementById("prediction").textContent = predicted

  const speech = new SpeechSynthesisUtterance(predicted);
  window.speechSynthesis.speak(speech);

  // Wait for speech to finish before allowing actions again
  speech.onend = () => {
    // allow click on button again
    stopActions = false;
  };
}

window.onkeydown = (event) => {
  if (event.key === 'p') {
    window.ipcRenderer.invoke("print", 
      document.getElementById("prediction").textContent
    );
  }
};
