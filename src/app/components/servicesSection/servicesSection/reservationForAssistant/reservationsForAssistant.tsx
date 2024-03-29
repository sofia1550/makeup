import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReservationsForAssistant,
  fetchServices,
  markReservationAsCompleted,
  deleteReservation,
  markReservationAsPending,
  Reservation,
} from "../../../../redux/serviceSlice/servicesSlice";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../redux/store/appHooks";
import {
  Container,
  Heading,
  RefreshButton,
  ReservationItem,
  StyledSelect,
} from "../ReservationsForAssistant.styles";
import { format } from "date-fns";
import ReservationsList from "./reservationsList";
import {
  HorarioDisponibilidad,
  fetchTodasLasReservas,
  actualizarEstadoReservaCurso,
  eliminarReservaCurso,
  ReservaConHorarios,
} from "@/app/redux/coursesSlice/coursesSlice";
import { AnimatePresence, motion } from "framer-motion";
import {
  CardButton,
  CardDetails,
  CardLabel,
  CardValue,
  IconWrapper,
} from "./reservationCard.styles";
import Select, { SingleValue, StylesConfig, GroupBase } from "react-select";
import { School, Person, CalendarToday, AccessTime } from "@mui/icons-material";
import SortIcon from "@mui/icons-material/Sort";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";

interface OptionType {
  value: string;
  label: string;
}

function ReservationsForAssistant() {
  const dispatch = useAppDispatch();
  const ayudanteId = useAppSelector((state) => state.auth.userId);
  const services = useAppSelector((state) => state.services.services);
  const reservations = useAppSelector(
    (state) => state.services.reservationsForAssistant
  );
  const [expandedReservation, setExpandedReservation] = useState<number | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const OrderIcon = sortOrder === "asc" ? SortByAlphaIcon : SortIcon;

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const courseReservations = useAppSelector((state) => state.cursos.reservas);
  const handleSelectChange = (option: SingleValue<OptionType>) => {
    setSelectedOption(option);
  };
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const handleToggleDetails = (id: number) => {
    if (expandedReservation === id) {
      setExpandedReservation(null);
    } else {
      setExpandedReservation(id);
    }
  };
  const handleCursoCompleteClick = (reservaId: number) => {
    dispatch(
      actualizarEstadoReservaCurso({ reservaId, estado: "completada" })
    ).then(() => {
      dispatch(fetchTodasLasReservas());
    });
  };

  const handleCursoPendingClick = (reservaId: number) => {
    dispatch(
      actualizarEstadoReservaCurso({ reservaId, estado: "pendiente" })
    ).then(() => {
      dispatch(fetchTodasLasReservas());
    });
  };

  const handleCursoDeleteClick = (reservaId: number) => {
    dispatch(eliminarReservaCurso(reservaId));
  };

  const formatFechaReserva = (fecha: string) =>
    format(new Date(fecha), "dd/MM/yyyy HH:mm");
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
  const ayudanteName = useAppSelector((state) => state.auth.userName);
  const [selectedStatus, setSelectedStatus] = React.useState<
    "pendiente" | "completada"
  >("pendiente");
  const filteredCourseReservations = useMemo(() => {
    return courseReservations.filter(
      (reservation) => reservation.estado === selectedStatus
    );
  }, [courseReservations, selectedStatus]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderedCourseReservations, setOrderedCourseReservations] = useState<
    ReservaConHorarios[]
  >([]);
  const [orderedServiceReservations, setOrderedServiceReservations] = useState<
    Reservation[]
  >([]);
  const sortReservations = useCallback(
    <T extends { fecha_reserva?: string }>(reservations: T[]) => {
      return reservations.slice().sort((a, b) => {
        if (!a.fecha_reserva || !b.fecha_reserva) return 0;
        const dateA = new Date(a.fecha_reserva);
        const dateB = new Date(b.fecha_reserva);
        return sortOrder === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
    },
    [sortOrder]
  );

  const handleCompleteClick = (reservationId: number) => {
    dispatch(markReservationAsCompleted(reservationId));
  };

  const handlePendingClick = (reservationId: number) => {
    dispatch(markReservationAsPending(reservationId));
  };

  const getServiceNameById = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.title : "Desconocido";
  };

  const handleDeleteClick = (reservationId: number) => {
    dispatch(deleteReservation(reservationId));
  };

  const fetchReservations = useCallback(() => {
    if (ayudanteId !== null) {
      dispatch(
        fetchReservationsForAssistant({ ayudanteId: Number(ayudanteId) })
      );
    }
  }, [ayudanteId, dispatch]);

  useEffect(() => {
    dispatch(fetchServices());
    fetchReservations();
  }, [dispatch, ayudanteId, fetchReservations]);

  useEffect(() => {
    fetchReservations();
  }, [services, fetchReservations]);
  useEffect(() => {
    if (selectedOption?.value === "cursos") {
      dispatch(fetchTodasLasReservas()).then(() =>
        console.log("Reservas de cursos actualizadas después de fetch")
      );
    }
  }, [dispatch, selectedOption]);
  useEffect(() => {
    if (selectedOption?.value === "servicios") {
      const filtered = reservations.filter((reservation) =>
        selectedStatus === "completada"
          ? reservation.estado === "completada" ||
            reservation.estado === "completado"
          : reservation.estado === selectedStatus
      );
      const orderedFilteredReservations = sortReservations(filtered);
      setOrderedServiceReservations(orderedFilteredReservations);
    }
  }, [reservations, selectedStatus, selectedOption, sortReservations]);

  useEffect(() => {}, [filteredCourseReservations]);
  useEffect(() => {
    // Ordena las reservas de cursos cada vez que cambien las reservas filtradas, el orden de clasificación o la función de clasificación.
    setOrderedCourseReservations(sortReservations(filteredCourseReservations));
  }, [filteredCourseReservations, sortOrder, sortReservations]);

  return (
    <Container>
      <Heading>Reservas para el ayudante {ayudanteName || ayudanteId}</Heading>
      <RefreshButton onClick={fetchReservations}>
        Refrescar Reservas
      </RefreshButton>
      <StyledSelect
        value={selectedStatus}
        onChange={(e) =>
          setSelectedStatus(e.target.value as "pendiente" | "completada")
        }
      >
        <option value="pendiente">Pendientes</option>
        <option value="completada">Completadas</option>
      </StyledSelect>
      <Select
        value={selectedOption}
        onChange={handleSelectChange}
        options={reservationOptions}
        styles={customStyles}
      />
      {selectedOption && (
        <>
          <div>
            <OrderIcon
              onClick={toggleSortOrder}
              style={{ cursor: "pointer" }}
            />
          </div>
        </>
      )}
      {selectedOption?.value === "servicios" && (
        <ReservationsList
          reservations={orderedServiceReservations}
          status={selectedStatus}
          onMarkComplete={handleCompleteClick}
          onDelete={handleDeleteClick}
          onMarkPending={handlePendingClick}
          getServiceNameById={getServiceNameById}
          format={format}
        />
      )}
      {selectedOption?.value === "cursos" &&
        orderedCourseReservations.map((courseReservation) => (
          <ReservationItem
            key={courseReservation.id}
            onClick={() =>
              courseReservation.id !== undefined &&
              handleToggleDetails(courseReservation.id)
            }
          >
            <CardDetails>
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
                  <CardDetails>
                    <CardLabel>
                      <IconWrapper>
                        <Person fontSize="small" />{" "}
                        {/* Icono para el usuario */}
                      </IconWrapper>
                      Usuario:
                    </CardLabel>
                    <CardValue>
                      {courseReservation.usuario_nombre || "Desconocido"}
                    </CardValue>
                  </CardDetails>

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
                        ? formatFechaReserva(courseReservation.fecha_reserva)
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
                      {courseReservation.nombre_usuario || "No disponible"}
                    </CardValue>
                  </CardDetails>

                  <CardDetails>
                    <CardLabel>Correo del Usuario:</CardLabel>
                    <CardValue>
                      {courseReservation.correo_usuario || "No disponible"}
                    </CardValue>
                  </CardDetails>

                  <CardDetails>
                    <CardLabel>Teléfono del Usuario:</CardLabel>
                    <CardValue>
                      {courseReservation.telefono_usuario || "No disponible"}
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
                  <div className="reservation-actions">
                    {selectedStatus === "pendiente" && (
                      <CardButton
                        className="complete"
                        onClick={() => {
                          if (courseReservation.id !== undefined) {
                            handleCursoCompleteClick(courseReservation.id);
                          }
                        }}
                      >
                        Marcar como Completada
                      </CardButton>
                    )}

                    {selectedStatus === "completada" && (
                      <CardButton
                        className="pending"
                        onClick={() => {
                          if (courseReservation.id !== undefined) {
                            handleCursoPendingClick(courseReservation.id);
                          }
                        }}
                      >
                        Marcar como Pendiente
                      </CardButton>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardButton
              className="delete"
              onClick={() => {
                if (courseReservation.id !== undefined) {
                  handleCursoDeleteClick(courseReservation.id);
                }
              }}
            >
              Eliminar Reserva
            </CardButton>
          </ReservationItem>
        ))}
    </Container>
  );
}

export default ReservationsForAssistant;
