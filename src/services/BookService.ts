import type { CreateBookDTO, UpdateBookDTO } from '../dtos/book.dto.js';
import { prisma } from '../database/prisma.js';
import { AppError } from '../errors/AppError.js';

function parseId(id: string): number {
  const value = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(value) || value < 1) throw new AppError('ID inválido');
  return value;
}

export class BookService {
  async list(search?: string) {
    return prisma.book.findMany({
      where: search ? { OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ] } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const book = await prisma.book.findUnique({ where: { id: parseId(id) } });
    if (!book) throw new AppError('Livro não encontrado', 404);
    return book;
  }

  async create(data: CreateBookDTO) {
    return prisma.book.create({ data });
  }

  async update(id: string, data: UpdateBookDTO) {
    const bookId = parseId(id);
    const result = await prisma.book.updateMany({ where: { id: bookId }, data });
    if (!result.count) throw new AppError('Livro não encontrado', 404);
    return prisma.book.findUniqueOrThrow({ where: { id: bookId } });
  }

  async remove(id: string): Promise<void> {
    const result = await prisma.book.deleteMany({ where: { id: parseId(id) } });
    if (!result.count) throw new AppError('Livro não encontrado', 404);
  }
}
