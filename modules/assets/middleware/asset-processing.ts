import PDFParser from 'pdf2json';
import { fromBase64 } from 'pdf2pic';
import { existsSync, mkdirSync } from 'fs';
import { PDFJson } from 'pdf2json/typings';
import path from 'path';

export class AssetProcessing {
  // Some constants
  PDF2PIC_DENSITY = 300;
  PDF2PIC_IMG_FORMAT = 'png';
  PDF2PIC_TEMP_SAVE_PATH = '/var/server/temp';
  PDF2PIC_LONG_SIDE = 900;

  async makePdfThumbnail(pdf: Buffer, page: number): Promise<path.ParsedPath> {
    const pdfJSON = await this.getPdfJSON(pdf);
    const pdfDim = this.getPdfDimensions(pdfJSON, page);
    const imgDimensions = this.setImageDimensions(pdfDim.ratio);

    const imageOptions = {
      density: this.PDF2PIC_DENSITY,
      saveFilename: pdfJSON.formImage.Agency,
      savePath: this.PDF2PIC_TEMP_SAVE_PATH,
      format: this.PDF2PIC_IMG_FORMAT,
      width: imgDimensions.width,
      height: imgDimensions.height,
    };

    if (!existsSync(this.PDF2PIC_TEMP_SAVE_PATH)) {
      mkdirSync(this.PDF2PIC_TEMP_SAVE_PATH);
    }

    // for some reason it was giving me greif about just a normal buffer
    const pdf_base64 = pdf.toString('base64');
    const convertToImage = fromBase64(pdf_base64, imageOptions);
    await convertToImage(page);

    const fullFileName: any = `${this.PDF2PIC_TEMP_SAVE_PATH}/${pdfJSON.formImage.Agency}.${page}.${this.PDF2PIC_IMG_FORMAT}`;
    const fileNameParsed = path.parse(fullFileName);

    return fileNameParsed;
  }

  getPdfJSON(pdf: Buffer): Promise<PDFJson> {
    const pdfParser = new PDFParser();
    return new Promise((resolve, reject) => {
      // why do i have to assign these to use them in the listeners
      const res = resolve;
      const rej = reject;

      // not sure why they made these listeners not just promises...
      pdfParser.on('pdfParser_dataReady', (pdfData: PDFJson) => {
        resolve(pdfData);
      });
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData);
      });
      pdfParser.parseBuffer(pdf);
    });
  }

  getPdfDimensions(
    pdfJSON: PDFJson,
    pageIndex: number
  ): { width: number; height: number; ratio: number } {
    // Page unit equals (96px/inch * 1inch / 4) = 24px/inch. See pdf2json/lib/pdfunit.js
    const pixelsPerInch = 24;

    const width = pdfJSON.formImage.Width * pixelsPerInch;
    const height = pdfJSON.formImage.Pages[pageIndex].Height * pixelsPerInch;
    const ratio = width / height;
    return { width, height, ratio };
  }

  setImageDimensions(ratio: number): { width: number; height: number } {
    let height = this.PDF2PIC_LONG_SIDE;
    let width = height * ratio;

    // if this is true, it's landscape and we need scale to width = 900
    if (ratio > 1) {
      const mul = this.PDF2PIC_LONG_SIDE / width;
      width = width * mul;
      height = height * mul;
    }
    return { width, height };
  }
}
