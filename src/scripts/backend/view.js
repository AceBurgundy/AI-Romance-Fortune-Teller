/* eslint-disable no-undef */
const { ipcMain, app, shell, BrowserWindow } = require('electron');
const { random } = require('./custom-random.js');
const { promises, writeFileSync, readFileSync, mkdirSync, existsSync } = require('fs');
const sizeOf = require('image-size');
const path = require('path');

const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const ImageModule = require('docxtemplater-image-module-free');

const basepath = app.getAppPath();

ipcMain.handle('random-heart', async _ => {
  const heartsPath = path.resolve(basepath, 'src/assets/images/hearts');
  const hearts = await promises.readdir(heartsPath);

  // return a randomly selected heart path
  return path.join(
      heartsPath, random(hearts)
  );
});

ipcMain.handle('print', async (event, prediction) => {
  // print options
  shell.openPath(
      await createDocFile(prediction)
  );
});

ipcMain.handle('save-to-desktop', async _ => {
  // print options
  const window = BrowserWindow.getFocusedWindow();
  if (!window) throw new Error('No active window found');

  const image = await window.capturePage();
  const destination = path.join(app.getPath('pictures'), 'AI Love Fortune Teller Captures');

  // Ensure the destination folder exists
  if (!existsSync(destination) === true) {
    mkdirSync(destination, { recursive: true });
  }

  const timeString = new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:/g, '-');

  // Define the file path and save the image
  const filePath = path.join(destination, `${timeString} moment.png`);
  writeFileSync(filePath, image.toPNG());

  shell.openPath(filePath);
});

/**
 * Captures a screenshot of the current app window and creates a DOCX file with the image.
 *
 * @async
 * @function createDocFile
 * @returns {Promise<string>} - A promise that resolves to the path of the created DOCX file.
 * @throws {Error} Throws an error if there is an issue capturing the screenshot or writing the output file.
 */
async function createDocFile() {
  const window = BrowserWindow.getFocusedWindow();
  if (!window) throw new Error('No active window found');

  const image = await window.capturePage();
  const prediction = image.toPNG().toString('base64');

  const file = path.join(app.getAppPath(), 'src/assets/prediction-template.docx');
  const content = readFileSync(file, 'binary');

  const zip = new PizZip(content);
  const options = {
    centered: true,
    fileType: 'docx',
    getImage: tagValue => Buffer.from(tagValue, 'base64'),
    getSize: image => {
      const dimensions = sizeOf(image);
      const maxWidth = 1030; // Set max width (adjust based on template size)
      const maxHeight = 700; // Set max height (adjust based on template size)

      let { width, height } = dimensions;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return [width, height];
    }
  };

  const imageModule = new ImageModule(options);
  const document = new Docxtemplater(zip, { modules: [imageModule] });
  await document.renderAsync({ prediction });

  const outputBuffer = document.getZip().generate({ type: 'nodebuffer' });
  const outputPath = path.join(app.getPath('temp'), 'screenshot.docx');

  writeFileSync(outputPath, outputBuffer);
  return outputPath;
}
