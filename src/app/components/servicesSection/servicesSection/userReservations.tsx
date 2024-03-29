import React, { useEffect, useState } from "react";
import { fetchReservationsForUser } from "../../../redux/serviceSlice/servicesSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store/appHooks";
import {
  HorarioDisponibilidad,
  fetchReservasPorCursoYUsuario,
} from "../../../redux/coursesSlice/coursesSlice";

import { format } from "date-fns";
import {
  Heading,
  ReservationItem,
  ReservationsList,
} from "./ReservationsForAssistant.styles";
import {
  CardButton,
  CardContainer,
  CardDetails,
  CardLabel,
  CardLink,
  CardValue,
  IconWrapper,
} from "./reservationForAssistant/reservationCard.styles";
import {
  Description,
  Money,
  CalendarToday,
  AccessTime,
  School,
} from "@mui/icons-material";
import { Event as EventIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Select, { SingleValue, StylesConfig, GroupBase } from "react-select";
interface OptionType {
  value: string;
  label: string;
}
function UserReservations() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const [selectedOption, setSelectedOption] =
    useState<SingleValue<OptionType>>(null);

  const reservations = useAppSelector(
    (state) => state.services.reservationsForUser
  );
  const courseReservations = useAppSelector((state) => state.cursos.reservas);
  function formatFechaReserva(fecha: string) {
    return format(new Date(fecha), "dd/MM/yyyy HH:mm");
  }

  const isLoading = useAppSelector((state) => state.services.loading);
  const error = useAppSelector((state) => state.services.error);
  const [expandedReservation, setExpandedReservation] = useState<number | null>(
    null
  );
  const hayReservas = reservations.length > 0 || courseReservations.length > 0;

  function formatHorarios(horarios: HorarioDisponibilidad[]) {
    if (horarios.length === 1) {
      const h = horarios[0];
      return `Los ${h.dia_semana} De ${h.hora_inicio} Hs A ${h.hora_fin} Hs`;
    } else {
      return horarios
        .map(
          (h) => `Los ${h.dia_semana} De ${h.hora_inicio} Hs A ${h.hora_fin} Hs`
        )
        .join(" Y ");
    }
  }
  const reservationOptions: OptionType[] = [
    { value: "servicios", label: "Reservas de Servicios" },
    { value: "cursos", label: "Reservas de Cursos" },
  ];
  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "#f2e0e4",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#d5a1b8",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      color: "black",
      backgroundColor: state.isSelected ? "#f2e0e4" : "white",
      "&:hover": {
        backgroundColor: "#f2e0e4",
      },
    }),
  };

  const handleSelectChange = (option: SingleValue<OptionType>) => {
    setSelectedOption(option);
  };
  const handleToggleDetails = (id: number) => {
    if (expandedReservation === id) {
      setExpandedReservation(null);
    } else {
      setExpandedReservation(id);
    }
  };

  useEffect(() => {
    if (userId !== null) {
      dispatch(fetchReservationsForUser(userId));
    }
  }, [dispatch, userId]);
  useEffect(() => {
    if (userId !== null) {
      const userIdNumber = Number(userId);
      dispatch(fetchReservasPorCursoYUsuario({ usuarioId: userIdNumber }));
    }
  }, [dispatch, userId]);

  if (isLoading) return <p>Cargando reservas...</p>;
  if (error) return <p>Error al cargar reservas: {error}</p>;

  return (
    <CardContainer>
      <Heading>Reservas para {userName || "Usuario"}</Heading>
      <Select
        value={selectedOption}
        onChange={handleSelectChange}
        options={reservationOptions}
        styles={customStyles}
      />
      <CardButton
        onClick={() => {
          if (userId !== null) {
            dispatch(fetchReservationsForUser(userId));
          }
        }}
      >
        Refrescar Reservas
      </CardButton>
      <ReservationsList>
        {hayReservas ? (
          <>
            {selectedOption?.value === "servicios" &&
              reservations.map((reservation) => (
                <ReservationItem key={reservation.id}>
                  <CardDetails
                    onClick={() => handleToggleDetails(reservation.id)}
                  >
                    <CardLabel>
                      <IconWrapper>
                        <Description fontSize="small" />
                      </IconWrapper>
                      Servicio:
                    </CardLabel>
                    <CardValue>
                      {reservation.serviceTitle || "Desconocido"}
                    </CardValue>
                  </CardDetails>

                  <AnimatePresence>
                    {expandedReservation === reservation.id && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={{
                          expanded: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <EventIcon fontSize="small" />
                            </IconWrapper>
                            Fecha de Reserva:
                          </CardLabel>
                          <CardValue>
                            {format(
                              new Date(reservation.fecha_reserva),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <EventIcon fontSize="small" />
                            </IconWrapper>
                            Rango de Reserva:
                          </CardLabel>
                          <CardValue>
                            {format(
                              new Date(reservation.fecha_inicio_reserva),
                              "dd/MM/yyyy HH:mm"
                            )}
                            {" - "}
                            {format(
                              new Date(reservation.fecha_fin_reserva),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <Description fontSize="small" />
                            </IconWrapper>
                            Opciones Seleccionadas:
                          </CardLabel>
                          <CardValue>
                            {JSON.parse(
                              reservation.opciones_seleccionadas
                            ).join(", ")}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <Description fontSize="small" />
                            </IconWrapper>
                            Estado:
                          </CardLabel>
                          <CardValue>{reservation.estado}</CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <Money fontSize="small" />
                            </IconWrapper>
                            Precio:
                          </CardLabel>
                          <CardValue>${reservation.precio}</CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <Description fontSize="small" />
                            </IconWrapper>
                            Comprobante:
                          </CardLabel>
                          <CardValue>
                            {reservation.comprobante_path ? (
                              <CardLink
                                href={`https://asdasdasd3.onrender.com/${reservation.comprobante_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver Comprobante
                              </CardLink>
                            ) : (
                              "No disponible"
                            )}
                          </CardValue>
                        </CardDetails>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ReservationItem>
              ))}
            {/* Renderizar reservas de cursos */}
            {selectedOption?.value === "cursos" &&
              courseReservations.map((courseReservation) => (
                <ReservationItem key={courseReservation.id}>
                  <CardDetails
                    onClick={() =>
                      courseReservation.id !== undefined &&
                      handleToggleDetails(courseReservation.id)
                    }
                  >
                    <CardLabel>
                      <IconWrapper>
                        <School fontSize="small" /> {/* Icono para el curso */}
                      </IconWrapper>
                      Curso:
                    </CardLabel>
                    <CardValue>
                      {courseReservation.curso_nombre || "Desconocido"}
                    </CardValue>
                  </CardDetails>

                  <AnimatePresence>
                    {expandedReservation === courseReservation.id && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={{
                          expanded: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        {/* Detalles de la reserva del curso */}
                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <CalendarToday fontSize="small" />{" "}
                              {/* Icono para la fecha */}
                            </IconWrapper>
                            Fecha de Reserva:
                          </CardLabel>
                          <CardValue>
                            {courseReservation.fecha_reserva
                              ? formatFechaReserva(
                                  courseReservation.fecha_reserva
                                )
                              : "No disponible"}
                          </CardValue>
                        </CardDetails>
                        <CardDetails>
                          <CardLabel>Fecha de Inicio:</CardLabel>
                          <CardValue>
                            {courseReservation.fecha_inicio || "No disponible"}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>Fecha de Fin:</CardLabel>
                          <CardValue>
                            {courseReservation.fecha_fin || "No disponible"}
                          </CardValue>
                        </CardDetails>
                        <CardDetails>
                          <CardLabel>
                            <IconWrapper>
                              <AccessTime fontSize="small" />{" "}
                              {/* Icono para los horarios */}
                            </IconWrapper>
                            Horarios:
                          </CardLabel>
                          <CardValue>
                            {formatHorarios(courseReservation.horarios)}
                          </CardValue>
                        </CardDetails>
                        <CardDetails>
                          <CardLabel>Nombre del Usuario:</CardLabel>
                          <CardValue>
                            {courseReservation.nombre_usuario ||
                              "No disponible"}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>Correo del Usuario:</CardLabel>
                          <CardValue>
                            {courseReservation.correo_usuario ||
                              "No disponible"}
                          </CardValue>
                        </CardDetails>

                        <CardDetails>
                          <CardLabel>Teléfono del Usuario:</CardLabel>
                          <CardValue>
                            {courseReservation.telefono_usuario ||
                              "No disponible"}
                          </CardValue>
                        </CardDetails>
                        {courseReservation.url_comprobante && (
                          <CardDetails>
                            <CardLabel>Comprobante de Pago:</CardLabel>
                            <a
                              href={courseReservation.url_comprobante}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Comprobante
                            </a>
                          </CardDetails>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ReservationItem>
              ))}
          </>
        ) : (
          <p>No cuentas actualmente con reservas.</p>
        )}
      </ReservationsList>{" "}
    </CardContainer>
  );
}

export default UserReservations;
