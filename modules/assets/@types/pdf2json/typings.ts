export interface PDFJson {
  formImage: {
    Transcoder: string,
    Agency: string,
    Id: {
      AgencyId: string,
      Name: string,
      MC: boolean,
      Max: number,
      parent: number
    },
    Width: number,
    Pages: PDFPage[]
  }
}

interface PDFPage {
  Height: number,
  Fields: any[],
  Boxsets: any[],
  HLines: PDFLine[],
  VLines: PDFLine[],
  Fills: PDFFill[],
  Texts: PDFText[]
}

interface PDFLine {
  x: number,
  y: number,
  w: number,
  l: number
}

interface PDFFill {
  x: number,
  y: number,
  w: number,
  h: number,
  clr: number
}

interface PDFText {
  x: number,
  y: number,
  w: number,
  sw: number,
  clr: number,
  A: string,
  R: PDFR[]
}

interface PDFR {
  T: string,
  S: number,
  TS: number[]
}