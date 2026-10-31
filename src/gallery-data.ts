// Pour ajouter les photos d'une édition : déposer les images dans public/images/photos/<année>/
// puis lister leurs noms dans le tableau correspondant.
const album = (folder: string, files: string[]) =>
  files.map((file) => `images/photos/${folder}${file}`);

export const galleryYears = [
  {
    year: 2024,
    photos: album("", [
      "photo37.JPG", "photo29.JPG", "photo2.JPG", "photo36.JPG", "photo5.JPG",
      "photo6.JPG", "photo9.JPG", "photo10.JPG", "photo11.JPG", "photo12.JPG",
      "photo15.JPG", "photo18.JPG", "photo23.JPG", "photo30.JPG", "photo38.JPG",
    ]),
  },
  {
    year: 2026,
    photos: album("2026/", []),
  },
];
