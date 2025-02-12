/* eslint-disable no-undef */
const { ipcMain, app, shell } = require('electron');
const { random } = require('./custom-random.js');
const { promises, writeFileSync, readFileSync } = require("fs");
const path = require('path');

const Docxtemplater = require('docxtemplater');
const {app} = require('electron');
const PizZip = require('pizzip');

var basepath = app.getAppPath();

ipcMain.handle('random-heart', async _ => {
  const heartsPath = path.resolve(basepath, "src/assets/images/hearts");
  const hearts = await promises.readdir(heartsPath);

  // return a randomly selected heart path
  return path.join(
    heartsPath, random(hearts)
  );
});

ipcMain.handle("print", async (event, prediction) => {
  // print options
  shell.openPath(
    await createDocFile(prediction)
  );
});

/**
 * Creates a doc file to be printed
 */
/**
 * Creates a DOCX file with the given prediction and saves it to a temporary location.
 *
 * @async
 * @function createDocFile
 * @param {string} prediction - The prediction text to be included in the DOCX file.
 * @returns {Promise<string>} - A promise that resolves to the path of the created DOCX file.
 * @throws {Error} Throws an error if there is an issue reading the template file or writing the output file.
 */
async function createDocFile(prediction) {
  const file = path.join(app.getAppPath(), "src/assets/prediction-template.docx");
  const content = readFileSync(file, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);

  doc.setData({ prediction });
  doc.render();

  const outputBuffer = doc.getZip().generate({type: 'nodebuffer'});
  const outputPath = path.join(app.getPath("temp"), 'prediction.docx');

  writeFileSync(outputPath, outputBuffer);
  return outputPath;
}
