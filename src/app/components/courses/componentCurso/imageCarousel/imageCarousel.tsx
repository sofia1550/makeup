// ImageCarousel.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/store/appHooks";
import {
  addImageToCurso,
  deleteImageFromCurso,
} from "@/app/redux/coursesSlice/coursesSlice";
// Importa deleteImageFromCurso si aún no lo has hecho
import {
  CarouselContainer,
  CarouselImage,
  ImageContainer,
  InnerTextBox,
  MainContainer,
  NavButton,
  TextContainer,
} from "./stylesImageCarousel";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
type ImageCarouselProps = {
  images: Array<{ id: number; url_imagen: string }>; // Asegúrate de que 'id' esté disponible
  baseUrl: string;
  title?: string;
  description?: string;
  cursoId: string;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  baseUrl,
  title,
  description,
  cursoId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userRoles = useAppSelector((state) => state.auth.userRoles);
  const dispatch = useAppDispatch();

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };
  const handleDeleteSelectedImage = async () => {
    const imageToDelete = images[currentIndex];
    if (
      imageToDelete &&
      window.confirm("¿Estás seguro de que quieres eliminar esta imagen?")
    ) {
      await dispatch(
        deleteImageFromCurso({ cursoId, imagenId: imageToDelete.id })
      );

      // Actualizar el índice si la imagen eliminada era la última
      if (currentIndex === images.length - 1) {
        setCurrentIndex(currentIndex - 1 >= 0 ? currentIndex - 1 : 0);
      }
    }
  };

  const handleSubmitImage = () => {
    if (selectedImage && cursoId) {
      const formData = new FormData();
      formData.append("imagen", selectedImage);
      dispatch(addImageToCurso({ cursoId: cursoId, imageData: formData }));
    }
  };

  return (
    <>
      <MainContainer>
        <CarouselContainer>
          <ImageContainer
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <CarouselImage
                key={index}
                src={`${baseUrl}image/cursos/${image.url_imagen}`}
                alt={`Imagen del Curso ${index + 1}`}
              />
            ))}
          </ImageContainer>
          <NavButton className="prev" onClick={goToPrevious}>
            ❮
          </NavButton>
          <NavButton className="next" onClick={goToNext}>
            ❯
          </NavButton>
        </CarouselContainer>
        <TextContainer>
          <InnerTextBox>
            <h2>{title}</h2>
            <p>{description}</p>
          </InnerTextBox>
        </TextContainer>
      </MainContainer>

      {isAuthenticated && userRoles?.includes("admin") && (
        <Button onClick={toggleEditMode}>
          {isEditing ? <DoneIcon /> : <EditIcon />}
          {isEditing ? "Finalizar Edición" : "Editar"}
        </Button>
      )}

      {isEditing && (
        <div>
          <Button
            onClick={handleDeleteSelectedImage}
            startIcon={<DeleteIcon />}
          >
            Eliminar Imagen Actual
          </Button>
          <div>
            Añadir Imagen al Curso:
            <input type="file" onChange={handleImageChange} />
            <Button onClick={handleSubmitImage}>Subir Imagen</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;