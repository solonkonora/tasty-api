//

const request = require('supertest');
const app = require('../app'); // Replace with your actual app file
const db = require('../database'); // Replace with your actual database connection

// Mock the Cloudinary upload function
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://example.com/image.jpg',
      }),
    },
  },
}));

describe('Image Upload', () => {
  afterAll(async () => {
    await db.end(); // Close the database connection after all tests
  });

  it('should upload an image and save the URL to the database', async () => {
    const imageFile = {
      fieldname: 'file',
      originalname: 'example.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('image data'),
      size: 1024,
    };

    const response = await request(app)
      .post('/api/upload')
      .attach('file', imageFile.buffer, imageFile.originalname);

    expect(response.status).toBe(200);
    expect(response.body.imageUrl).toBe('https://example.com/image.jpg');

    // Check if the image URL was saved to the database
    const [rows] = await db.query('SELECT * FROM images WHERE url = ?', ['https://example.com/image.jpg']);
    expect(rows.length).toBe(1);
  });
});