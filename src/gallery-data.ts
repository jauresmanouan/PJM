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
    // kamdom.JPG est la seule photo de 2025 retrouvée ; le reste reprend des photos de la même collecte non utilisées en 2024
    // (photo13, photo4 et photo28 retirées : mêmes scènes que photo9, photo6 et photo30 de 2024).
    year: 2025,
    photos: album("", [
      "kamdom.JPG", "photo34.JPG", "photo14.JPG", "photo31.JPG", "photo39.JPG", "photo27.JPG",
      "photo24.JPG", "photo21.JPG", "photo3.JPG", "photo25.JPG",
    ]),
  },
  {
    year: 2026,
    photos: album("2026/", []),
  },
];
