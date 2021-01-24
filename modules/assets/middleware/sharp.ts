import sharp from 'sharp';

export class Sharp {
  PROFILE_PICTURE_HEIGHT = 300;
  PROFILE_PICTURE_WIDTH = 300;

  async resizeProfilePicture(input: Buffer) {
    const sharpImage = await sharp(input)
      .resize(this.PROFILE_PICTURE_WIDTH, this.PROFILE_PICTURE_HEIGHT, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .toFormat('jpeg')
      .toBuffer();
    return sharpImage;
  }
}
