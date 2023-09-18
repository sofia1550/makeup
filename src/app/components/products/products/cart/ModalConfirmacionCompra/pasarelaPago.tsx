import React, { useState } from "react";
import { Button } from "@mui/material";
import axios from "axios";
import { StyledPasarelaPago } from "./styledPasarelaPago";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import CargarComprobante from "./uploadComprobant";
import { useAppSelector } from "../../cart/contextCart/store/appHooks"; 

interface PasarelaPagoProps {
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
  total: number;
  datosUsuario: {
    nombre: string;
    email: string;
    telefono: string;
  };
  datosEnvio: {
    metodo_envio: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    pais: string;
  };
  ordenId: string | null;
}

const PasarelaPago: React.FC<PasarelaPagoProps> = ({
  onPaymentSuccess,
  onPaymentFailure,
  total,
  datosUsuario,
  datosEnvio,
  ordenId,
}) => {
  const cartItems = useAppSelector((state) => state.cart); // Aquí tomamos los productos desde Redux

  const [preferenceId, setPreferenceId] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);
  const [loadedComprobante, setLoadedComprobante] = useState<File | null>(null);

  initMercadoPago("TEST-75e8ff76-27ca-4d24-8d0e-9ea271a2ef88");

  const closePaymentMethod = () => {
    setShowUploadOption(false);
  };

  const showPaymentMethod = () => {
    setShowUploadOption(true);
  };

  const handleUploadSuccess = (data: any) => {
    console.log("Comprobante cargado con éxito:", data);
    setUploadSuccessMessage("Comprobante cargado con éxito");
    setLoadedComprobante(data.comprobante);
    setTimeout(() => {
      setUploadSuccessMessage(null);
      closePaymentMethod();
    }, 3000);
  };

  const handleUploadError = (error: any) => {
    console.error("Error al cargar el comprobante:", error);
  };

  const handlePayment = async () => {
    const paymentData = {
      total,
      datosUsuario,
      datosEnvio,
      productos: cartItems, // Usamos cartItems en lugar de productos
    };

    const userToken = localStorage.getItem("jwt");
    console.log("Datos enviados al backend:", paymentData);

    try {
      const response = await axios.post(
        "http://localhost:3002/api/mercadopago/create_preference",
        paymentData,
        {
          headers: {
            "x-auth-token": userToken,
          },
        }
      );

      if (response.data && response.data.id) {
        setPreferenceId(response.data.id);
      } else {
        console.error("No se recibió el id de preferencia de MercadoPago.");
        onPaymentFailure();
      }
    } catch (error: any) {
      console.error("Error procesando el pago:", error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error);
      } else {
        onPaymentFailure();
      }
    }
  };

  return (
    <StyledPasarelaPago>
      <h5 className="main-title">Pasarela de Pago</h5>

      <div className="section-card user-section">
        <h6>Datos del Usuario</h6>
        <div className="user-details">
          <p>
            <strong>Nombre:</strong> {datosUsuario.nombre}
          </p>
          <p>
            <strong>Email:</strong> {datosUsuario.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {datosUsuario.telefono}
          </p>
        </div>
      </div>

      <div className="section-card products-section">
        <h6>Productos a comprar:</h6>
        <ul className="products-list">
          {cartItems.map(
            (
              producto 
            ) => (
              <li key={producto.id}>
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="product-image"
                />
                <span>
                  <strong>{producto.nombre}</strong> - $
                  {producto.precio.toFixed(2)} x {producto.cantidad}
                </span>
              </li>
            )
          )}
        </ul>
      </div>

      <div className="section-card shipping-section">
        <h6>Datos de envío:</h6>
        <div className="shipping-details">
          <p>
            <strong>Método de Envío:</strong> {datosEnvio.metodo_envio}
          </p>
          <p>
            <strong>Dirección:</strong> {datosEnvio.direccion}
          </p>
          <p>
            <strong>Ciudad:</strong> {datosEnvio.ciudad}
          </p>
          <p>
            <strong>Estado:</strong> {datosEnvio.estado}
          </p>
          <p>
            <strong>Código Postal:</strong> {datosEnvio.codigo_postal}
          </p>
          <p>
            <strong>País:</strong> {datosEnvio.pais}
          </p>
        </div>
      </div>

      <div className="section-card payment-section">
        <h6>Detalles del pago</h6>
        <p className="total">
          <strong>Total a pagar:</strong> ${total.toFixed(2)}
        </p>

        <div className="payment-actions">
          {/* Muestra el botón "Pagar con Depósito" solo si showUploadOption es false */}
          {!showUploadOption && (
            <Button
              variant="contained"
              color="secondary"
              onClick={showPaymentMethod}
            >
              Pagar con Deposito
            </Button>
          )}

          {showUploadOption && (
            <React.Fragment>
              <Button
                variant="contained"
                color="secondary"
                onClick={closePaymentMethod}
              >
                Cerrar Método de Pago
              </Button>
              <CargarComprobante
                orderId={ordenId}
                total={total}
                loadedComprobante={loadedComprobante}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </React.Fragment>
          )}

          <Button variant="contained" color="primary" onClick={handlePayment}>
            Pagar con MercadoPago
          </Button>
        </div>
      </div>

      <div className="notifications">
        {preferenceId && <Wallet initialization={{ preferenceId }} />}
        {uploadSuccessMessage && (
          <p className="success-message">{uploadSuccessMessage}</p>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </StyledPasarelaPago>
  );
};

export default PasarelaPago;