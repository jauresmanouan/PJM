import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";

export default function Galerie() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = [
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

  // Gestion de l'ouverture/fermeture du modal
  useEffect(() => {
    if (selectedImage) {
      setIsModalOpen(true);
    }
  }, [selectedImage]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300); // Temps pour la transition
  };

  return (
    <div className="bg-bleu py-10 flex flex-col items-center">
      <Badge
        variant="jaune"
        className="mb-6 text-lg px-4 py-2 rounded-full shadow-md"
      >
        Quelques images
      </Badge>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 w-11/12 md:w-10/12">
        {images.map((src, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedImage(src)}
          >
            <img
              src={src}
              alt={`Amoureux_${index + 1}`}
              className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Modal avec transition smooth */}
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
