import { fromBase64 } from 'pdf2pic';
import { existsSync, mkdirSync } from 'fs';
import { parse, ParsedPath } from 'path';
import { PDFDocument } from 'pdf-lib';

export class Asset2Thumbnail {
  // Some constants
  PDF2PIC_DENSITY = 300;
  PDF2PIC_IMG_FORMAT = 'png';
  PDF2PIC_TEMP_SAVE_PATH = '/var/server/temp';
  PDF2PIC_LONG_SIDE = 900;

  async makePdfThumbnail(pdf: Buffer, pdfName: string, page: number): Promise<ParsedPath> {
    const pageDimensions = await this.getPdfSizeData(pdf, page);
    const imgDimensions = this.setImageDimensions(pageDimensions.ratio);
    const imageOptions = {
      density: this.PDF2PIC_DENSITY,
      saveFilename: pdfName,
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

    // we don't have control over the output of this, so this is assumed
    const fullFileName = `${this.PDF2PIC_TEMP_SAVE_PATH}/${pdfName}.${page}.${this.PDF2PIC_IMG_FORMAT}`;
    const fileNameParsed = parse(fullFileName);

    return fileNameParsed;
  }

  async getPdfSizeData(pdf: Buffer, page: number) {
    const pdfDoc = await PDFDocument.load(pdf, {
      updateMetadata: false,
    });
    const pdfPage = pdfDoc.getPage(page);
    const size = pdfPage.getSize(); // dimensions are supposedly in points...
    const pdfSizeData = { ...size, ratio: size.width / size.height };
    return pdfSizeData;
  }

  getPdfDimensions(pageDimensions: {
    width: number;
    height: number;
  }): { width: number; height: number; ratio: number } {
    // TODO: Get real data here? Save read data here?!
    const width = pageDimensions.width;
    const height = pageDimensions.height;
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
