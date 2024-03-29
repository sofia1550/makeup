"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
const socket = io("https://asdasdasd3.onrender.com");
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../redux/store/appHooks";
import {
  addAvailability,
  checkIfUserIsAssigned,
  fetchAvailabilities,
  deleteAvailability,
  updateAvailabilityStatus,
  updateServiceDescription,
  setServiceDescription,
  updateSocialLinks,
  setServiceData,
} from "../../../../redux/serviceSlice/servicesSlice";
import AvailabilityCalendar from "./availabilityCalendar";
import ConfirmReservationModal from "../confirmReservationModal";
import {
  ActionButton,
  ActionContainer,
  ButtonContainer,
  CloseButton,
  InnerScrollContainer,
  ModalHeader,
  ModalTitle,
  PrimaryButton,
  SecondaryButton,
  ServiceModalContent,
  StyledButton,
  StyledModal,
} from "./styledModalService";
import ServiceCarousel from "./serviceCarousel";
import ServiceOptionsManager from "./serviceOptionsManager";
import { EventPropGetter } from "react-big-calendar";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

interface CalendarEvent {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  estado?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  selectedService: {
    id: number;
    title: string;
    description: string;
    color?: string;
    image_url?: string;
    image_path?: string;
    modal_description?: string;
    facebook_url?: string;
    whatsapp_url?: string;
    instagram_url?: string;
  };
}
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ServiceModal: React.FC<ServiceModalProps> = React.memo(
  ({ isOpen, onRequestClose, selectedService }) => {
    const serviceImages = useAppSelector(
      (state) => state.services.serviceImages[selectedService.id] || []
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isClient, setIsClient] = useState(false);

    const [isEditingOptions, setIsEditingOptions] = useState(false);

    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lastAddedTimestamp, setLastAddedTimestamp] = useState<number | null>(
      null
    );
    const [facebookUrl, setFacebookUrl] = useState<string>(
      selectedService.facebook_url || ""
    );
    const [whatsappUrl, setWhatsappUrl] = useState<string>(
      selectedService.whatsapp_url || ""
    );
    const [instagramUrl, setInstagramUrl] = useState<string>(
      selectedService.instagram_url || ""
    );
    const [selectedForDeletion, setSelectedForDeletion] = useState<
      CalendarEvent[]
    >([]);
    const dispatch = useAppDispatch();
    const isUserAssigned = useAppSelector(
      (state) => state.services.isUserAssigned
    );
    const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<
      number | null
    >(null);
    const [
      confirmReservationForHelperOpen,
      setConfirmReservationForHelperOpen,
    ] = useState(false);
    useEffect(() => {
      // Este efecto se ejecutará solo en el lado del cliente.
      setIsClient(true);
    }, []);

    // Importación dinámica de ReactQuill solo en el cliente

    const [showCalendar, setShowCalendar] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState<string>("");
    const [isEditingCarousel, setIsEditingCarousel] = useState(false);

    // Obtener las disponibilidades del estado global
    const availabilities = useAppSelector(
      (state) => state.services.availabilities
    );
    type CalendarView = "month" | "week" | "day" | "agenda" | "work_week";
    const [currentView, setCurrentView] = useState<CalendarView>("day");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [localSelectedService, setLocalSelectedService] =
      useState(selectedService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [forceRender, setForceRender] = useState(false);
    const [isEditingSocialLinks, setIsEditingSocialLinks] = useState(false);

    const handleSelectAvailability = useCallback(
      (availabilityId: number) => {
        const selectedAvailability = availabilities.find(
          (availability) => availability.id === availabilityId
        );
        if (selectedAvailability) {
        }

        setSelectedAvailabilityId(availabilityId);
        setConfirmModalOpen(true);
        if (isUserAssigned) {
          setConfirmReservationForHelperOpen(true);
        } else {
          // Si es un usuario normal, sigue el flujo existente
          setConfirmModalOpen(true);
        }
      },
      [availabilities, isUserAssigned]
    );

    interface MyEvent {
      id?: number;
      title: string;
      start: Date;
      end: Date;
      allDay: boolean;
      estado?: string;
    }

    const eventStyleGetter: EventPropGetter<MyEvent> = (event) => {
      const newStyle = {
        className: "",
        style: {},
      };

      if (event.estado === "reservado") {
        newStyle.className = "rbc-event-Reservado";
        newStyle.style = {
          backgroundColor: "#800020",
          color: "FFFDD0",
        };
      } else if (event.estado === "disponible") {
        newStyle.className = "rbc-event-Disponible";
        newStyle.style = {
          backgroundColor: "#B2AC88",
          color: "FFFFFF",
        };
      }

      return newStyle;
    };
    // Convertir disponibilidades al formato adecuado para el calendario
    const calendarEvents = useMemo(() => {
      return [
        ...availabilities.map((availability) => ({
          id: availability.id,
          title:
            availability.estado === "reservado" ? "Reservado" : "Disponible",
          start: new Date(availability.fecha_inicio),
          end: new Date(availability.fecha_fin),
          allDay: false,
          estado: availability.estado || "disponible",
        })),
        ...selectedEvents,
      ];
    }, [availabilities, selectedEvents]);

    const handleAddAvailability = async () => {
      if (selectedService) {
        for (const event of selectedEvents) {
          const resultAction = await dispatch(
            addAvailability({
              serviceId: selectedService.id,
              fechaInicio: event.start.toISOString(),
              fechaFin: event.end.toISOString(),
            })
          );

          if (addAvailability.fulfilled.match(resultAction)) {
            dispatch(fetchAvailabilities(selectedService.id));
          }
        }

        setLastAddedTimestamp(Date.now());
        setSelectedEvents([]); // Limpiamos el arreglo después de agregar las disponibilidades
      }
    };

    const currentFetchedServiceId = useAppSelector(
      (state) => state.services.lastFetchedServiceId
    );
    const handleCloseModal = () => {
      setSelectedEvents([]); // Limpiamos las disponibilidades seleccionadas
      setShowCalendar(false); // Reiniciar el estado del calendario

      onRequestClose(); // Notifica al componente padre para cerrar el modal
    };

    const handleConfirmModalClose = () => {
      setConfirmModalOpen(false);
    };

    const selectedAvailabilityDetails = availabilities.find(
      (availability) => availability.id === selectedAvailabilityId
    );
    const serviceData = useAppSelector(
      (state) => state.services.serviceData[selectedService.id]
    );
    useEffect(() => {
      if (isOpen && selectedService && selectedService.id) {
        // Verificar si los datos del servicio ya están cargados
        if (!serviceData) {
          // Si no están cargados, realiza las acciones de carga necesarias
          dispatch(fetchAvailabilities(selectedService.id));
          dispatch(checkIfUserIsAssigned(selectedService.id));
          dispatch(setServiceData(selectedService));
        } else {
        }
      }
    }, [isOpen, selectedService, dispatch, serviceData]);

    const handleDeleteSelected = () => {
      if (
        window.confirm(
          "¿Estás seguro de que quieres eliminar las disponibilidades seleccionadas?"
        )
      ) {
        selectedForDeletion.forEach((event) => {
          if (event.id) {
            dispatch(deleteAvailability(event.id))
              .then(() => {})
              .catch(() => {
                alert(
                  "Error al eliminar la disponibilidad. Por favor intenta de nuevo."
                );
              });
          }
        });
        setSelectedForDeletion([]); // Limpia la lista después de intentar eliminar
      }
    };

    const fetchedRef = useRef(false);
    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"], // Texto en negrita, cursiva, subrayado y tachado
      ["blockquote", "code-block"], // Bloques de citas y código

      [{ header: 1 }, { header: 2 }], // Encabezados de diferentes niveles
      [{ list: "ordered" }, { list: "bullet" }], // Listas
      [{ script: "sub" }, { script: "super" }], // Subíndices y superíndices
      [{ indent: "-1" }, { indent: "+1" }], // Sangría
      [{ direction: "rtl" }], // Texto de derecha a izquierda

      // Tamaños de fuente personalizados
      [
        {
          size: [
            "small",
            false,
            "large",
            "huge",
            "10px",
            "12px",
            "14px",
            "16px",
            "18px",
            "20px",
          ],
        },
      ],

      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      // Colores personalizados para el texto y el fondo
      [
        {
          color: [
            "#000000",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#ffffff",
            "#facccc",
            "#ffebcc",
            "#ffffcc",
            "#cce8cc",
            "#cce0f5",
            "#ebd6ff",
            "#bbbbbb",
            "#f06666",
            "#ffc266",
            "#ffff66",
            "#66b966",
            "#66a3e0",
            "#c285ff",
            "#888888",
            "#a10000",
            "#b26b00",
            "#b2b200",
            "#006100",
            "#0047b2",
            "#6b24b2",
            "#444444",
            "#5c0000",
            "#663d00",
            "#666600",
            "#003700",
            "#002966",
            "#3d1466",
          ],
        },
        {
          background: [
            "#000000",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#ffffff",
            "#facccc",
            "#ffebcc",
            "#ffffcc",
            "#cce8cc",
            "#cce0f5",
            "#ebd6ff",
            "#bbbbbb",
            "#f06666",
            "#ffc266",
            "#ffff66",
            "#66b966",
            "#66a3e0",
            "#c285ff",
            "#888888",
            "#a10000",
            "#b26b00",
            "#b2b200",
            "#006100",
            "#0047b2",
            "#6b24b2",
            "#444444",
            "#5c0000",
            "#663d00",
            "#666600",
            "#003700",
            "#002966",
            "#3d1466",
          ],
        },
      ],

      [{ font: [] }],
      [{ align: [] }],

      ["clean"], // Eliminar formato
    ];

    const modules = {
      toolbar: toolbarOptions,
    };

    useEffect(() => {
      if (
        isOpen &&
        selectedService &&
        selectedService.id &&
        !fetchedRef.current
      ) {
        // Solo realiza la solicitud si el servicio seleccionado es diferente al último obtenido
        if (currentFetchedServiceId !== selectedService.id) {
          dispatch(fetchAvailabilities(selectedService.id));
          dispatch(checkIfUserIsAssigned(selectedService.id));
          fetchedRef.current = true;
        }
      }

      // Reset fetchedRef cuando el modal se cierra
      return () => {
        fetchedRef.current = false;
      };
    }, [isOpen, selectedService, dispatch, currentFetchedServiceId]);
    useEffect(() => {
      const handleAvailabilityChanged = (data: {
        availabilityId: string;
        newStatus: string;
      }) => {
        const payload = {
          availabilityId: parseInt(data.availabilityId, 10),
          newStatus: data.newStatus,
        };
        dispatch(updateAvailabilityStatus(payload));
      };

      socket.on("availabilityChanged", handleAvailabilityChanged);

      return () => {
        socket.off("availabilityChanged", handleAvailabilityChanged);
      };
    }, [dispatch]);
    const saveDescriptionChanges = async () => {
      try {
        await dispatch(
          updateServiceDescription({
            serviceId: selectedService.id,
            newDescription: editedDescription,
          })
        );
        setLocalSelectedService((prevService) => ({
          ...prevService,
          modal_description: editedDescription,
        }));

        setIsEditingDescription(false);
      } catch (error) {
        alert(
          "Hubo un error al actualizar la descripción. Inténtalo de nuevo."
        );
      }
    };
    const handleSaveSocialLinks = () => {
      dispatch(
        updateSocialLinks({
          serviceId: selectedService.id,
          facebook_url: facebookUrl,
          whatsapp_url: whatsappUrl,
          instagram_url: instagramUrl,
        })
      );
    };
    useEffect(() => {
      const handleServiceDescriptionChanged = (data: {
        serviceId: number;
        newDescription: string;
      }) => {
        dispatch(setServiceDescription(data));

        // Si el evento del socket es para el servicio actualmente seleccionado, actualiza el estado local
        if (selectedService && selectedService.id === data.serviceId) {
          setLocalSelectedService((prevService) => ({
            ...prevService,
            modal_description: data.newDescription,
          }));

          setForceRender((prev) => !prev);
        }
      };

      socket.on("serviceDescriptionChanged", handleServiceDescriptionChanged);
      return () => {
        socket.off(
          "serviceDescriptionChanged",
          handleServiceDescriptionChanged
        );
      };
    }, [dispatch, selectedService]);
    useEffect(() => {}, [serviceImages]);
    // Controla la renderización del modal
    useEffect(() => {
      if (isOpen) {
      } else {
        setSelectedEvents([]); // Limpieza cuando el modal se cierra
        setShowCalendar(false); // Reiniciar el estado del calendario cuando el modal se cierra
      }
    }, [isOpen]);
    if (!isOpen) {
      return null; // No renderiza el modal si no está abierto
    }

    if (!selectedService) return null;
    return (
      <>
        <StyledModal isOpen={isOpen} onRequestClose={handleCloseModal}>
          <InnerScrollContainer>
            <div onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <ModalHeader>
                  <ModalTitle>{selectedService.title}</ModalTitle>
                  <StyledButton variant="contained" onClick={handleCloseModal}>
                    Cerrar
                  </StyledButton>
                </ModalHeader>

                <ServiceModalContent>
                  <ServiceCarousel
                    serviceId={selectedService.id}
                    images={serviceImages}
                    isUserAssigned={!!isUserAssigned}
                    isEditing={isEditingCarousel}
                  />

                  <div className="description-container">
                    {isEditingDescription ? (
                      <ReactQuill
                        theme="snow"
                        value={editedDescription}
                        modules={modules} // Asegúrate de que se pasa la configuración aquí
                        onChange={setEditedDescription}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: localSelectedService.modal_description || "",
                        }}
                      />
                    )}
                  </div>
                  <div className="social-icons">
                    {isEditingSocialLinks ? (
                      <>
                        <div className="social-link-field">
                          <FaFacebook className="social-icon" />
                          <input
                            className="social-input"
                            placeholder="Facebook URL"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                          />
                        </div>
                        <div className="social-link-field">
                          <FaWhatsapp className="social-icon" />
                          <input
                            className="social-input"
                            placeholder="WhatsApp URL"
                            value={whatsappUrl}
                            onChange={(e) => setWhatsappUrl(e.target.value)}
                          />
                        </div>
                        <div className="social-link-field">
                          <FaInstagram className="social-icon" />
                          <input
                            className="social-input"
                            placeholder="Instagram URL"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                          />
                        </div>
                        <ActionButton onClick={handleSaveSocialLinks}>
                          Guardar URLs
                        </ActionButton>
                        <ActionButton
                          onClick={() => setIsEditingSocialLinks(false)}
                        >
                          Cancelar
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        <a
                          href={facebookUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaFacebook className="social-icon" />
                        </a>
                        <a
                          href={whatsappUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaWhatsapp className="social-icon" />
                        </a>
                        <a
                          href={instagramUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaInstagram className="social-icon" />
                        </a>
                      </>
                    )}
                  </div>

                  {isUserAssigned && (
                    <ActionContainer>
                      {isEditingOptions ? (
                        <ActionButton
                          onClick={() => setIsEditingOptions(false)}
                        >
                          Finalizar Edición de Opciones
                        </ActionButton>
                      ) : (
                        <ActionButton onClick={() => setIsEditingOptions(true)}>
                          Editar Opciones de Servicio
                        </ActionButton>
                      )}

                      {isEditingDescription ? (
                        <>
                          <ActionButton onClick={saveDescriptionChanges}>
                            Guardar Cambios
                          </ActionButton>
                          <ActionButton
                            onClick={() => setIsEditingDescription(false)}
                          >
                            Cancelar
                          </ActionButton>
                        </>
                      ) : (
                        <ActionButton
                          onClick={() => {
                            setIsEditingDescription(true);
                            setEditedDescription(
                              selectedService.modal_description || ""
                            );
                          }}
                        >
                          Editar Descripción
                        </ActionButton>
                      )}

                      {isEditingCarousel ? (
                        <ActionButton
                          onClick={() => setIsEditingCarousel(false)}
                        >
                          Finalizar Edición del Carrusel
                        </ActionButton>
                      ) : (
                        <ActionButton
                          onClick={() => setIsEditingCarousel(true)}
                        >
                          Editar Carrusel
                        </ActionButton>
                      )}

                      {isEditingSocialLinks ? (
                        <ActionButton
                          onClick={() => setIsEditingSocialLinks(false)}
                        >
                          Finalizar Edición de SocialLinks
                        </ActionButton>
                      ) : (
                        <ActionButton
                          onClick={() => setIsEditingSocialLinks(true)}
                        >
                          Editar SocialLinks
                        </ActionButton>
                      )}
                    </ActionContainer>
                  )}
                </ServiceModalContent>

                {isEditingOptions && isUserAssigned && (
                  <ServiceOptionsManager serviceId={selectedService.id} />
                )}
                {!showCalendar ? (
                  <ButtonContainer>
                    <PrimaryButton onClick={() => setShowCalendar(true)}>
                      Reservar
                    </PrimaryButton>
                  </ButtonContainer>
                ) : (
                  <>
                    <AvailabilityCalendar
                      eventPropGetter={eventStyleGetter}
                      isOpen={showCalendar}
                      onRequestClose={() => setShowCalendar(false)}
                      currentView={currentView}
                      onCurrentViewChange={setCurrentView}
                      events={calendarEvents}
                      isUserAssigned={isUserAssigned || false}
                      onSelectSlot={(slotInfo) => {
                        const newEvent = {
                          title: "Disponible",
                          start: slotInfo.start,
                          end:
                            slotInfo.end === slotInfo.start
                              ? new Date(
                                  slotInfo.start.getTime() + 60 * 60 * 1000
                                )
                              : slotInfo.end,
                          allDay: false,
                        };
                        setSelectedEvents((prevEvents) => [
                          ...prevEvents,
                          newEvent,
                        ]);
                      }}
                      onSelectEvent={(event) => {
                        if (event.estado === "reservado") {
                          return;
                        }
                        if (isUserAssigned) {
                          if (typeof event.id === "number") {
                            setSelectedAvailabilityId(event.id);
                          }
                        } else {
                          if (typeof event.id === "number") {
                            handleSelectAvailability(event.id);
                          }
                        }
                      }}
                    />

                    {isUserAssigned === null ? (
                      <p>Verificando permisos...</p>
                    ) : (
                      isUserAssigned && (
                        <>
                          <PrimaryButton onClick={handleAddAvailability}>
                            Agregar Disponibilidad
                          </PrimaryButton>
                          <SecondaryButton
                            onClick={() =>
                              setConfirmReservationForHelperOpen(true)
                            }
                          >
                            Reservar
                          </SecondaryButton>
                          <SecondaryButton onClick={handleDeleteSelected}>
                            Eliminar Disponibilidad
                          </SecondaryButton>
                        </>
                      )
                    )}

                    <CloseButton onClick={() => setShowCalendar(false)}>
                      Cerrar Calendario
                    </CloseButton>
                  </>
                )}

                <ConfirmReservationModal
                  isOpen={confirmModalOpen}
                  onRequestClose={handleConfirmModalClose}
                  serviceId={selectedService.id}
                  disponibilidadId={selectedAvailabilityId || 0}
                  availabilityDetails={{
                    fecha_inicio:
                      selectedAvailabilityDetails?.fecha_inicio ||
                      "Fecha de inicio no definida",
                    fecha_fin:
                      selectedAvailabilityDetails?.fecha_fin ||
                      "Fecha de fin no definida",
                  }}
                />
                {isUserAssigned && (
                  <ConfirmReservationModal
                    isOpen={confirmReservationForHelperOpen}
                    onRequestClose={() =>
                      setConfirmReservationForHelperOpen(false)
                    }
                    serviceId={selectedService.id}
                    disponibilidadId={selectedAvailabilityId || 0}
                    availabilityDetails={{
                      fecha_inicio:
                        selectedAvailabilityDetails?.fecha_inicio ||
                        "Fecha de inicio no definida",
                      fecha_fin:
                        selectedAvailabilityDetails?.fecha_fin ||
                        "Fecha de fin no definida",
                    }}
                  />
                )}
              </motion.div>
            </div>
          </InnerScrollContainer>
        </StyledModal>
      </>
    );
  }
);
ServiceModal.displayName = "ServiceModal";
export default ServiceModal;
