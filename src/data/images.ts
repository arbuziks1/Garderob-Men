function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const IMG = {
  leatherJacketModel: unsplash('photo-1521223890158-f9f7c3d5d504'),
  leatherJacketProduct: unsplash('photo-1551028719-00167b16eac5'),
  denimJacketProduct: unsplash('photo-1611312449408-fcece27cdbb7'),
  denimJacketModel: unsplash('photo-1516257984-b1b4d707412e'),
  bomberProduct: unsplash('photo-1591047139829-d91aecb6caea'),
  quiltedJacketModel: unsplash('photo-1548126032-079a0fb0099d'),
  hoodieGreyModel: unsplash('photo-1556821840-3a63f95609a7'),
  sweatshirtWhiteProduct: unsplash('photo-1620799140408-edc6dcb6d633'),
  graphicTeeModel: unsplash('photo-1503341504253-dff4815485f1'),
  pinkSweatshirtModel: unsplash('photo-1516826957135-700dedea698c'),
  jeansRackProduct: unsplash('photo-1576995853123-5a10305d93c0'),
  chinosModel: unsplash('photo-1473966968600-fa801b869a1a'),
  outfitFlatlay: unsplash('photo-1593030761757-71fae45fa0e7'),
  checkSuitModel: unsplash('photo-1594938298603-c8148c4dae35'),
  navySuitModel: unsplash('photo-1617137968427-85924c800a22'),
  shirtsFolded: unsplash('photo-1602810318383-e386cc2a3ccf'),
  sneakerDark: unsplash('photo-1491553895911-0055eca6402d'),
  sneakerTan: unsplash('photo-1549298916-b41d501d3772'),
  sneakerTeal: unsplash('photo-1595341888016-a392ef81b7de'),
  sneakerWhiteOrange: unsplash('photo-1600185365926-3a2ce3cdb9eb'),
  capGrey: unsplash('photo-1521369909029-2afed882baee'),
  bootsFlatlay: unsplash('photo-1614676471928-2ed0ad1061a4'),
  clothesRack: unsplash('photo-1578932750294-f5075e85f44a'),
};
