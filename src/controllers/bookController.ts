import fs from 'fs';
import path from 'path';
import { Context } from 'koa';
import { listBooks, Book } from '../../adapter/assignment-1';

// Define the Book type
type Book = {
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
};

// Load book data
const booksFilePath = path.join(__dirname, '../../mcmasterful-book-list.json');
let books: Book[] = [];

try {
  const data = fs.readFileSync(booksFilePath, 'utf8');
  books = JSON.parse(data);
  console.log('Books loaded:', books);
} catch (err) {
  console.error('Error reading book list file:', err);
}

// Get all books
export const getAllBooks = (ctx: any) => {
  ctx.body = books;
};

// Filter books by price range
export const filterBooks = (ctx: any) => {
  const body = ctx.request.body as { from?: number, to?: number }[];
  let returnBooks: Book[] = [];

  for (let i = 0; i < body.length; i++) {
    const minPrice = body[i].from ?? 0;
    const maxPrice = body[i].to ?? Number.MAX_SAFE_INTEGER;
    const filteredBooks = books.filter(
      (book) => book.price >= minPrice && book.price <= maxPrice
    );
    returnBooks = returnBooks.concat(filteredBooks);
  }

  ctx.body = returnBooks.length > 0 ? returnBooks : { message: 'No books found in this price range.' };
};

// Add a new book
export const addBook = (ctx: any) => {
  const newBook = ctx.request.body as Book;
  books.push(newBook);
  ctx.body = { message: 'Book added successfully' };
};

// Define BookController class
export class BookController {
  public async getBooks(ctx: Context): Promise<void> {
    try {
      const { minPrice, maxPrice } = ctx.query;

      const filters = [];
      if (minPrice !== undefined || maxPrice !== undefined) {
        const from = minPrice ? parseFloat(minPrice as string) : 0;
        const to = maxPrice ? parseFloat(maxPrice as string) : Number.MAX_VALUE;

        if (isNaN(from) || isNaN(to) || from < 0 || to < 0 || from > to) {
          ctx.status = 400;
          ctx.body = { error: 'Invalid price range provided.' };
          return;
        }

        filters.push({ from, to });
      }

      const books: Book[] = await listBooks(filters);
      ctx.status = 200;
      ctx.body = books;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message || 'Internal server error.' };
    }
  }
}

export default BookController;