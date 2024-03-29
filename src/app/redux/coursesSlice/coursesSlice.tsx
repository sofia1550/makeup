import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface HorarioDisponibilidad {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}
export interface ReservaConHorarios {
  id?: number;
  disponibilidad_id: number;
  usuario_id: number;
  estado: "pendiente" | "completada";
  fecha_reserva?: string;
  curso_nombre?: string;
  horarios: HorarioDisponibilidad[];
  nombre_usuario?: string;
  correo_usuario?: string;
  telefono_usuario?: string;
  url_comprobante?: string;
  usuario_nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface Disponibilidad {
  id: number;
  curso_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  max_reservas: number;
  horarios?: HorarioDisponibilidad[];
  reservasActuales?: number;
  estado?: string;
}
interface CursoConDisponibilidades extends Curso {
  disponibilidades?: Disponibilidad[];
}

interface Clase {
  id: number;
  curso_id: number;
  titulo: string;
  descripcion: string;
  orden: number;
  video_url?: string;
  material_adicional?: string;
}
interface ImagenCurso {
  id: number;
  curso_id: number;
  url_imagen: string;
  descripcion?: string;
}
interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion?: string;
  nivel?: string;
  imagen_principal?: string;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  clases: Clase[];
  imagenes: ImagenCurso[];
}
interface ImagenUploadResponse {
  message: string;
  path: string;
}
interface ActualizarEstadoReservaPayload {
  reservaId: number;
  estado: "pendiente" | "completada";
}

interface CursoState {
  cursoActual: CursoConDisponibilidades | null;
  cursos: Curso[];
  disponibilidades: Disponibilidad[];
  loading: boolean;
  error: string | null;
  reservas: ReservaConHorarios[];
}
export const actualizarEstadoDisponibilidad = createAsyncThunk(
  "cursos/actualizarEstadoDisponibilidad",
  async (
    {
      cursoId,
      disponibilidadId,
      nuevoEstado,
    }: { cursoId: number; disponibilidadId: number; nuevoEstado: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/disponibilidades/${disponibilidadId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevoEstado }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la disponibilidad");
      }

      return { cursoId, disponibilidadId, nuevoEstado };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const verificarReservasActuales = createAsyncThunk(
  "cursos/verificarReservasActuales",
  async (disponibilidadId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas/verificar/${disponibilidadId}`
      );
      if (!response.ok) throw new Error("Error al verificar las reservas");
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);
export const subirComprobantePago = createAsyncThunk(
  "cursos/subirComprobantePago",
  async (
    {
      reservaId,
      comprobanteData,
    }: { reservaId: number; comprobanteData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas/${reservaId}/comprobante`,
        {
          method: "POST",
          body: comprobanteData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir comprobante de pago");
      }

      const data = await response.json();
      return { reservaId, urlComprobante: data.comprobanteURL } as {
        reservaId: number;
        urlComprobante: string;
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const actualizarEstadoReservaCurso = createAsyncThunk(
  "cursos/actualizarEstadoReservaCurso",
  async (
    { reservaId, estado }: ActualizarEstadoReservaPayload,
    { rejectWithValue }
  ) => {
    try {
      const userToken = localStorage.getItem("jwt");
      if (!userToken) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }

      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas/cursos/${reservaId}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": userToken, // Incluir el token en los headers
          },
          body: JSON.stringify({ estado: estado }),
        }
      );

      if (!response.ok)
        throw new Error("Error al actualizar estado de la reserva");

      return { reservaId, estado: estado };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Ocurrió un error desconocido");
    }
  }
);

export const eliminarReservaCurso = createAsyncThunk(
  "cursos/eliminarReservaCurso",
  async (reservaId: number, { rejectWithValue }) => {
    try {
      const userToken = localStorage.getItem("jwt");
      if (!userToken) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }

      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas/cursos/${reservaId}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": userToken, // Incluir el token en los headers
          },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar reserva");
      return reservaId;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Ocurrió un error desconocido");
    }
  }
);

export const fetchTodasLasReservas = createAsyncThunk(
  "cursos/fetchTodasLasReservas",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas/todas`
      );
      if (!response.ok) {
        throw new Error("Error al obtener todas las reservas");
      }
      const reservas = await response.json();

      return reservas as ReservaConHorarios[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const updateCursoPrecio = createAsyncThunk<
  { message: string; cursoId: number; nuevoPrecio: number },
  { cursoId: number; nuevoPrecio: number },
  { rejectValue: string }
>(
  "cursos/updateCursoPrecio",
  async ({ cursoId, nuevoPrecio }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/precio`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ precio: nuevoPrecio }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el precio del curso");
      }

      const data = await response.json();
      return { message: data.message, cursoId, nuevoPrecio };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const fetchReservasAdminPorCurso = createAsyncThunk<
  ReservaConHorarios[],
  { cursoId: number },
  { rejectValue: string }
>(
  "cursos/fetchReservasAdminPorCurso",
  async ({ cursoId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/reservas/admin`
      );

      if (!response.ok) {
        throw new Error("Error al obtener reservas para admin");
      }

      const reservas = await response.json();
      return reservas as ReservaConHorarios[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const fetchReservasPorCursoYUsuario = createAsyncThunk<
  ReservaConHorarios[],
  { usuarioId: number },
  { rejectValue: string }
>(
  "cursos/fetchReservasPorUsuario",
  async ({ usuarioId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/usuarios/${usuarioId}/reservas`
      );

      if (!response.ok) {
        throw new Error("Error al obtener reservas para el usuario");
      }

      const reservas = await response.json();
      return reservas as ReservaConHorarios[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

/* export const deleteImageFromCurso = createAsyncThunk<
  { message: string; imagenId: number },
  { cursoId: string; imagenId: number },
  { rejectValue: string }
>(
  "cursos/deleteImageFromCurso",
  async ({ cursoId, imagenId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/imagenes/${imagenId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo eliminar la imagen");
      }

      const data = await response.json();
      return { message: data.message, imagenId }; 
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
); */
export const deleteImageFromCurso = createAsyncThunk<
  { message: string; imagenId: number },
  { cursoId: string; imagenId: number },
  { rejectValue: string }
>(
  "cursos/deleteImageFromCurso",
  async ({ cursoId, imagenId }, { rejectWithValue }) => {
    // Condición para desactivar la eliminación real
    const eliminarImagen = false; // Cambiar a 'true' para activar la eliminación

    if (eliminarImagen) {
      try {
        const response = await fetch(
          `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/imagenes/${imagenId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo eliminar la imagen");
        }

        const data = await response.json();
        return { message: data.message, imagenId };
      } catch (error) {
        return rejectWithValue(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    } else {
      // Devolver un resultado fijo en caso de que la eliminación esté desactivada
      return { message: "Eliminación desactivada", imagenId };
    }
  }
);

export const agregarHorariosDisponibilidad = createAsyncThunk<
  HorarioDisponibilidad[],
  { disponibilidadId: number; horarios: HorarioDisponibilidad[] },
  { rejectValue: string }
>(
  "cursos/agregarHorariosDisponibilidad",
  async ({ disponibilidadId, horarios }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/disponibilidades/${disponibilidadId}/horarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ horarios }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar horarios");
      }

      const horariosAgregados = await response.json();
      return horariosAgregados as HorarioDisponibilidad[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

export const fetchDisponibilidades = createAsyncThunk<
  Disponibilidad[],
  { cursoId: number; estado?: string; limite?: number },
  { rejectValue: string }
>(
  "cursos/fetchDisponibilidades",
  async ({ cursoId, estado, limite }, { rejectWithValue }) => {
    try {
      const url = `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/disponibilidades`;

      const params = new URLSearchParams();
      if (estado) {
        params.append("estado", estado);
      }
      if (limite !== undefined) {
        params.append("limite", limite.toString());
      }

      const fullUrl = `${url}?${params.toString()}`;
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error("Error al obtener disponibilidades");
      }
      const disponibilidades = await response.json();
      return disponibilidades;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

// Agregar disponibilidad a un curso

export const agregarDisponibilidad = createAsyncThunk<
  Disponibilidad,
  {
    cursoId: number;
    fecha_inicio: string;
    fecha_fin: string;
    max_reservas: number;
  },
  { rejectValue: string }
>(
  "cursos/agregarDisponibilidad",
  async (
    { cursoId, fecha_inicio, fecha_fin, max_reservas },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/disponibilidades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha_inicio, fecha_fin, max_reservas }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar disponibilidad");
      }

      const nuevaDisponibilidad = await response.json();

      return nuevaDisponibilidad as Disponibilidad;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);
export const agregarReservaConDatos = createAsyncThunk(
  "cursos/agregarReservaConDatos",
  async (datosReserva: ReservaConHorarios, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/reservas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosReserva),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al agregar reserva con datos"
        );
      }

      const nuevaReserva = await response.json();
      return nuevaReserva as ReservaConHorarios;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);
// Agregar reserva a una disponibilidad
export const agregarReserva = createAsyncThunk<
  ReservaConHorarios, // Tipo de respuesta esperada
  ReservaConHorarios, // Tipo de argumento para la acción
  { rejectValue: string }
>("cursos/agregarReserva", async (datosReserva, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `https://asdasdasd3.onrender.com/api/reservas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosReserva),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error) {
        // Si el backend envía un mensaje de error específico
        return rejectWithValue(errorData.error);
      }
      throw new Error("Error al agregar reserva");
    }

    const nuevaReserva = await response.json();
    return nuevaReserva as ReservaConHorarios;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
});

/* export const addImageToCurso = createAsyncThunk<
  ImagenUploadResponse,
  { cursoId: string; imageData: FormData },
  { rejectValue: string }
>(
  "cursos/addImageToCurso",
  async ({ cursoId, imageData }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/imagenes`,
        {
          method: "POST",
          body: imageData,
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo cargar la imagen");
      }

      const data = await response.json();
      return data as ImagenUploadResponse; 
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
); */
export const addImageToCurso = createAsyncThunk<
  ImagenUploadResponse,
  { cursoId: string; imageData: FormData },
  { rejectValue: string }
>(
  "cursos/addImageToCurso",
  async ({ cursoId, imageData }, { rejectWithValue }) => {
    // Variable para controlar si se debe realizar la carga real
    const realizarCarga = false;

    if (realizarCarga) {
      // Realiza la carga de la imagen si 'realizarCarga' es verdadero
      try {
        const response = await fetch(
          `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/imagenes`,
          {
            method: "POST",
            body: imageData,
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo cargar la imagen");
        }

        const data = await response.json();
        return data as ImagenUploadResponse;
      } catch (error) {
        return rejectWithValue(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    } else {
      // Devuelve un resultado fijo si 'realizarCarga' es falso
      return Promise.resolve({
        message: "Carga de imagen simulada exitosamente",
        imagenId: Date.now(), // Genera un ID falso para la imagen
        path: "ruta/ficticia/de/la/imagen.jpg",
      } as ImagenUploadResponse);
    }
  }
);

export const fetchCursoCompletoById = createAsyncThunk<
  Curso,
  string,
  { rejectValue: string }
>("cursos/fetchCursoCompletoById", async (cursoId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `https://asdasdasd3.onrender.com/api/cursos/${cursoId}/completo`
    );
    if (!response.ok) {
      throw new Error("No se pudo cargar el curso");
    }
    const curso = await response.json();
    return curso as Curso;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
});

const initialState: CursoState = {
  cursoActual: null,
  cursos: [],
  disponibilidades: [],
  reservas: [],
  loading: false,
  error: null,
};
const cursosSlice = createSlice({
  name: "cursos",
  initialState,
  reducers: {
    actualizarDisponibilidad(state, action: PayloadAction<Disponibilidad>) {
      state.disponibilidades.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actualizarEstadoDisponibilidad.fulfilled, (state, action) => {
        const { cursoId, disponibilidadId, nuevoEstado } = action.payload;

        state.cursos = state.cursos.map((curso) => {
          if (curso.id === cursoId) {
            const cursoConDisp = curso as CursoConDisponibilidades;
            const disponibilidadesActualizadas =
              cursoConDisp.disponibilidades?.map((d) => {
                if (d.id === disponibilidadId) {
                  return { ...d, estado: nuevoEstado };
                }
                return d;
              });
            return {
              ...cursoConDisp,
              disponibilidades: disponibilidadesActualizadas,
            };
          }
          return curso;
        });

        if (state.cursoActual && state.cursoActual.id === cursoId) {
          state.cursoActual.disponibilidades =
            state.cursoActual.disponibilidades?.map((d) => {
              if (d.id === disponibilidadId) {
                return { ...d, estado: nuevoEstado };
              }
              return d;
            });
        }
      })
      .addCase(actualizarEstadoDisponibilidad.rejected, (state, action) => {
        state.error =
          action.error.message ||
          "Error al actualizar el estado de la disponibilidad";
      })
      .addCase(verificarReservasActuales.fulfilled, (state, action) => {
        const disponibilidadId = action.meta.arg;
        const index = state.disponibilidades.findIndex(
          (d) => d.id === disponibilidadId
        );
        if (index !== -1) {
          state.disponibilidades[index].reservasActuales =
            action.payload.reservasActuales;
        }
      })
      .addCase(agregarReservaConDatos.fulfilled, (state, action) => {
        // Agregar la nueva reserva al estado
        state.reservas.push(action.payload);
      })
      .addCase(agregarReservaConDatos.rejected, (state, action) => {
        // Manejar el caso en que la reserva no se pudo agregar
        state.error = action.error.message || "No se pudo agregar la reserva";
      })
      .addCase(subirComprobantePago.fulfilled, (state, action) => {
        // Actualizar la reserva con la URL del comprobante
        const { reservaId, urlComprobante } = action.payload;
        const reservaIndex = state.reservas.findIndex(
          (r) => r.id === reservaId
        );
        if (reservaIndex !== -1) {
          state.reservas[reservaIndex].url_comprobante = urlComprobante;
        }
      })
      .addCase(actualizarEstadoReservaCurso.fulfilled, (state, action) => {
        const { reservaId, estado } = action.payload;
        const reservaIndex = state.reservas.findIndex(
          (reserva) => reserva.id === reservaId
        );
        if (reservaIndex !== -1) {
          state.reservas[reservaIndex].estado = estado;
        }
      })
      .addCase(actualizarEstadoReservaCurso.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })
      .addCase(eliminarReservaCurso.fulfilled, (state, action) => {
        state.reservas = state.reservas.filter(
          (reserva) => reserva.id !== action.payload
        );
      })
      .addCase(eliminarReservaCurso.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })
      .addCase(fetchTodasLasReservas.fulfilled, (state, action) => {
        state.reservas = action.payload;
      })
      .addCase(fetchTodasLasReservas.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })
      .addCase(updateCursoPrecio.fulfilled, (state, action) => {
        const { cursoId, nuevoPrecio } = action.payload;
        if (state.cursoActual && state.cursoActual.id === cursoId) {
          state.cursoActual.precio = nuevoPrecio;
        }
        // Actualizar el precio en la lista de cursos si la tienes en el estado
        const index = state.cursos.findIndex((curso) => curso.id === cursoId);
        if (index !== -1) {
          state.cursos[index].precio = nuevoPrecio;
        }
      })
      .addCase(updateCursoPrecio.rejected, (state, action) => {
        state.error = action.error?.message || "Error desconocido";
      })
      // Reducer para manejar las reservas obtenidas por el administrador
      .addCase(fetchReservasAdminPorCurso.fulfilled, (state, action) => {
        state.reservas = action.payload; // Asigna directamente las reservas al estado
      })
      .addCase(fetchReservasAdminPorCurso.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })

      // Reducer para manejar las reservas obtenidas por usuario y curso
      .addCase(fetchReservasPorCursoYUsuario.fulfilled, (state, action) => {
        state.reservas = action.payload; // Asigna directamente las reservas al estado
      })
      .addCase(fetchReservasPorCursoYUsuario.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })
      .addCase(agregarReserva.fulfilled, (state, action) => {
        const nuevaReserva: ReservaConHorarios = action.payload;
        state.reservas.push(nuevaReserva);
      })
      .addCase(agregarReserva.rejected, (state, action) => {
        if (action.payload) {
          // Si el payload contiene un mensaje de error específico
          state.error = action.payload;
        } else {
          // Manejo de otros errores
          state.error = "No se pudo agregar la reserva. Error desconocido.";
        }
      })
      .addCase(deleteImageFromCurso.fulfilled, (state, action) => {
        if (state.cursoActual && state.cursoActual.imagenes) {
          // Filtrar y eliminar la imagen del array 'imagenes'
          state.cursoActual.imagenes = state.cursoActual.imagenes.filter(
            (imagen) => imagen.id !== action.payload.imagenId
          );
        }
      })
      .addCase(deleteImageFromCurso.rejected, (state, action) => {
        state.error = action.error?.message || "Error desconocido";
      })
      .addCase(agregarHorariosDisponibilidad.fulfilled, (state, action) => {
        const index = state.disponibilidades.findIndex(
          (disponibilidad) =>
            disponibilidad.id === action.meta.arg.disponibilidadId
        );
        if (index !== -1) {
          state.disponibilidades[index].horarios = action.payload;
        }
      })
      .addCase(fetchDisponibilidades.fulfilled, (state, action) => {
        state.disponibilidades = action.payload;
      })
      .addCase(fetchDisponibilidades.rejected, (state, action) => {
        state.error = action.error?.message || "Error desconocido";
      })
      .addCase(agregarDisponibilidad.fulfilled, (state, action) => {
        const nuevaDisponibilidad: Disponibilidad = action.payload;

        state.disponibilidades.push(nuevaDisponibilidad);
      })
      .addCase(agregarDisponibilidad.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido";
      })

      .addCase(addImageToCurso.fulfilled, (state, action) => {
        if (state.cursoActual && state.cursoActual.imagenes) {
          const nuevaImagen: ImagenCurso = {
            id: state.cursoActual.imagenes.length + 1,
            curso_id: parseInt(action.meta.arg.cursoId),
            url_imagen: action.payload.path,
            descripcion: "",
          };
          state.cursoActual.imagenes.push(nuevaImagen);
        }
      })
      .addCase(addImageToCurso.rejected, (state, action) => {
        state.error = action.error?.message || "Error desconocido";
      })
      .addCase(fetchCursoCompletoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCursoCompletoById.fulfilled, (state, action) => {
        state.cursoActual = action.payload;
        state.loading = false;
      })
      .addCase(fetchCursoCompletoById.rejected, (state, action) => {
        state.error = action.error?.message || "Error desconocido";
        state.loading = false;
      });
  },
});
export const { actualizarDisponibilidad } = cursosSlice.actions;

export default cursosSlice.reducer;
