export interface CartItem {
  productId: string;
  title: string;
  image: string;
  colorId: string;
  colorName: string;
  sizeStockId: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  maxStock: number;
}
