import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";

export default function Galerie() {
  // ✅ Typage explicite des états
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ✅ Typage du tableau d’images
  const images: string[] = [
    "images/photos/photo37.JPG",
    "images/photos/photo29.JPG",
    "images/photos/photo2.JPG",
    "images/photos/photo36.JPG",
    "images/photos/photo5.JPG",
    "images/photos/photo6.JPG",
    "images/photos/photo9.JPG",
    "images/photos/photo10.JPG",
    "images/photos/photo11.JPG",
    "images/photos/photo12.JPG",
    "images/photos/photo15.JPG",
    "images/photos/photo18.JPG",
    "images/photos/photo23.JPG",
    "images/photos/photo30.JPG",
    "images/photos/photo38.JPG",
  ];

  useEffect(() => {
    if (selectedImage) {
      setIsModalOpen(true);
    }
  }, [selectedImage]);

  const closeModal = (): void => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  return (
    <div className="bg-bleu py-10 flex flex-col items-center">
      <Badge
        variant="jaune"
        className="mb-6 text-sm md:text-lg px-4 py-2 rounded-full shadow-md"
      >
        Quelques images des participants de 2024
      </Badge>
      {/* <p className="text-center text-white font-Raleway mb-3">Merci à chacun </p> */}

      {/* ✅ Typage implicite grâce au map sur un tableau de string */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 w-11/12 md:w-10/12 ">
        {images.map((src: string, index: number) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedImage(src)}
          >
            <img
              src={src}
              alt={`Amoureux_${index + 1}`}
              className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
              loading="lazy" // 🔹 améliore les performances sur mobile
            />
          </div>
        ))}
      </div>

      {/* ✅ Le rendu du modal reste sûr grâce au typage de selectedImage */}
      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`max-w-full max-h-full transition-transform duration-300 ${
              isModalOpen ? "scale-100" : "scale-90"
            }`}
          >
            <img
              src={selectedImage}
              alt="Pleine taille"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
