import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { galleryYears } from "@/gallery-data";
import logo from "../../public/iconePJM.svg";

export default function Galerie() {
  // ✅ Typage explicite des états
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const latest = [...galleryYears].reverse().find((g) => g.photos.length);
  const [year, setYear] = useState(latest?.year ?? galleryYears[0].year);
  const images = galleryYears.find((g) => g.year === year)?.photos ?? [];

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
    <section id="galerie" className="scroll-mt-16 bg-bleu py-16 flex flex-col items-center font-Raleway">
      <Badge
        variant="jaune"
        className="mb-6 text-sm md:text-lg px-4 py-2 rounded-full shadow-md"
      >
        Les roses des participants
      </Badge>

      <div className="flex gap-3 mb-8">
        {galleryYears.map((g) => (
          <button
            key={g.year}
            onClick={() => setYear(g.year)}
            className={`rounded-full px-5 py-2 font-bold transition-colors duration-200 ${
              g.year === year
                ? "bg-jaune text-white"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {g.year}
          </button>
        ))}
      </div>

      {images.length === 0 && (
        <div className="w-11/12 md:w-10/12 rounded-3xl bg-white/10 text-white flex flex-col items-center text-center px-6 py-16 md:py-24">
          <img src={logo} alt="" className="w-14 md:w-20 mb-6" />
          <p className="font-black text-2xl md:text-4xl">
            L'album {year} se prépare
          </p>
          <p className="mt-3 text-sm md:text-lg text-white/80 max-w-md">
            Après le 8 décembre, les photos de vos roses déposées en paroisse
            prendront place ici.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 w-11/12 md:w-10/12 ">
        {images.map((src: string, index: number) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedImage(src)}
          >
            <img
              src={src}
              alt={`Amoureux_${index + 1}`}
              className="w-full h-44 md:h-64 object-cover transform hover:scale-105 transition-transform duration-500"
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
    </section>
  );
}
