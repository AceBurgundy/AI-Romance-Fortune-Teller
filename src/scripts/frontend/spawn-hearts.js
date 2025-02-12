/**
 * Asynchronously creates and animates a heart image element on the screen.
 * The heart image is requested from the main process via IPC and then
 * animated from a random starting position at the bottom of the screen
 * to a random ending position at the top of the screen.
 *
 * @async
 * @function heart
 * @returns {Promise<void>} A promise that resolves when the heart animation is complete.
 */
export async function spawnHeart() {
  // Request heart image path
  const heartPath = await window.ipcRenderer.invoke("random-heart");

  // Create the image element
  const image = document.createElement("img");
  image.src = heartPath;
  image.style.position = "absolute";
  image.style.height = "250px"; // Fixed height
  image.style.width = "250px"; // Fixed width
  image.style.border = "none"
  image.style.objectFit = "cover";
  
  document.body.appendChild(image);

  // Generate random start position
  const stepSize = Math.round(window.innerWidth / 10);
  const startX = stepSize * Math.floor(Math.random() * 11);
  const startY = window.innerHeight + 250;

  // Set initial position
  image.style.left = `${startX}px`;
  image.style.top = `${startY}px`;

  // Randomly determine end position
  const endX = Math.random() < 0.5 ? startX * 0.65 : startX * 1.25;
  const endY = -250;

  // Animation parameters
  const moveDistanceY = 10;
  const moveDistanceX = 0.5 * (startX < endX ? 1 : -1);

  function moveUp() {
    let currentX = parseFloat(image.style.left);
    let currentY = parseFloat(image.style.top);

    if (currentY > endY) {
      image.style.top = `${currentY - moveDistanceY}px`;
    }

    const shouldMoveX = Math.abs(currentX - endX) > Math.abs(moveDistanceX);
    
    if (shouldMoveX) {
      image.style.left = `${currentX + moveDistanceX}px`;
    }

    if (currentY <= endY) {
      image.remove();
      return;
    }

    requestAnimationFrame(moveUp);
  }

  moveUp();
}
