import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { prisma } from '../lib/prisma';
import { LABEL_TO_CATEGORY, LABEL_TO_FIT } from '../lib/labels';
import { serializeProduct } from '../lib/serializers';

export const adminProductsRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? './uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});

adminProductsRouter.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded (field name must be "image")' });
    return;
  }
  try {
    const filename = `${crypto.randomUUID()}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);
    await sharp(req.file.buffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);
    res.status(201).json({ url: `/uploads/${filename}` });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

interface ColorInput {
  id?: string;
  name: string;
  hex: string;
  images: string[];
  stock: { S: number; M: number; L: number; XL: number; XXL: number };
}

interface ProductInput {
  title: string;
  category: string;
  fit: string;
  price: number;
  oldPrice?: number;
  description: string;
  modelNote?: string;
  colors: ColorInput[];
}

function colorsCreateData(colors: ColorInput[]) {
  return colors.map((color, position) => ({
    name: color.name,
    hex: color.hex,
    position,
    stockS: color.stock.S,
    stockM: color.stock.M,
    stockL: color.stock.L,
    stockXl: color.stock.XL,
    stockXxl: color.stock.XXL,
    images: {
      create: color.images.map((url, imgPosition) => ({ url, position: imgPosition })),
    },
  }));
}

const include = { colors: { include: { images: true } } } as const;

adminProductsRouter.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({ include, orderBy: { createdAt: 'asc' } });
  res.json(products.map(serializeProduct));
});

adminProductsRouter.post('/', async (req, res) => {
  try {
    const body = req.body as ProductInput;
    const category = LABEL_TO_CATEGORY[body.category];
    const fit = LABEL_TO_FIT[body.fit];
    if (!category) throw new Error(`Unknown category label: ${body.category}`);
    if (!fit) throw new Error(`Unknown fit label: ${body.fit}`);

    const product = await prisma.product.create({
      data: {
        title: body.title,
        category,
        fit,
        price: body.price,
        oldPrice: body.oldPrice,
        description: body.description,
        modelNote: body.modelNote,
        colors: { create: colorsCreateData(body.colors) },
      },
      include,
    });
    res.status(201).json(serializeProduct(product));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

adminProductsRouter.put('/:id', async (req, res) => {
  try {
    const body = req.body as ProductInput;
    const category = LABEL_TO_CATEGORY[body.category];
    const fit = LABEL_TO_FIT[body.fit];
    if (!category) throw new Error(`Unknown category label: ${body.category}`);
    if (!fit) throw new Error(`Unknown fit label: ${body.fit}`);

    // The admin form always submits the whole product (same semantics as the old
    // localStorage storage.upsertProduct), so the simplest correct update is to
    // replace all colors/images rather than diff them. Deleting ProductColor rows
    // cascades to their ProductImage rows; OrderItem keeps its snapshot fields and
    // only loses its productId FK if the product itself is later deleted, not here.
    const product = await prisma.$transaction(async (tx) => {
      await tx.productColor.deleteMany({ where: { productId: req.params.id } });
      return tx.product.update({
        where: { id: req.params.id },
        data: {
          title: body.title,
          category,
          fit,
          price: body.price,
          oldPrice: body.oldPrice,
          description: body.description,
          modelNote: body.modelNote,
          colors: { create: colorsCreateData(body.colors) },
        },
        include,
      });
    });
    res.json(serializeProduct(product));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

adminProductsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
