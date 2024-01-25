import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "@emotion/styled";
import Image from "next/image";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const ChatIcon = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #d3b8ae; // Color beige para el icono del chat
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
`;
const Container = styled.div<ContainerProps>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  border: 1px solid #d3b8ae; // Color beige suave para el borde
  border-radius: 15px;
  background-color: #faf3f0; // Color de fondo claro
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); // Sombra más suave
  padding: 15px;
  box-sizing: border-box;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  display: ${({ isExpanded }) =>
    isExpanded ? "block" : "none"}; // Controlar la visibilidad
`;

const Header = styled.div`
  background-color: #d3b8ae; // Color beige para la cabecera
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessageList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 15px;
  color: black;
`;

const Message = styled.li<{ author: string }>`
  text-align: ${({ author }) => (author === "user" ? "right" : "left")};
  margin-bottom: 12px;
  line-height: 1.4;
  color: black;

  &:before {
    content: ${({ author }) => (author === "user" ? `'You:'` : `'Bot:'`)};
    font-weight: bold;
    margin-right: 8px;
    color: ${({ author }) => (author === "user" ? "#007bff" : "#ff4500")};
  }
`;

const Input = styled.input`
  width: calc(100% - 120px);
  padding: 10px 15px;
  border-radius: 25px;
  border: 2px solid #ff69b4; // Color rosa para el borde
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border 0.3s ease;
  color: black;

  &:focus {
    border-color: #ff1493; // Un rosa más oscuro para el foco
    outline: none;
  }
`;
const MessageItem = styled.li<{ author: string }>`
  text-align: ${({ author }) => (author === "user" ? "right" : "left")};
  margin-bottom: 12px;
  line-height: 1.4;

  &:before {
    content: ${({ author }) => (author === "user" ? `'You:'` : `'Bot:'`)};
    font-weight: bold;
    margin-right: 8px;
    color: ${({ author }) => (author === "user" ? "#007bff" : "#ff4500")};
  }
`;
const Button = styled.button`
  padding: 10px 15px;
  margin-left: 10px;
  border-radius: 25px;
  border: none;
  background-color: #ff69b4;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff1493;
  }
`;
interface Message {
  author: string;
  content: string;
  imageUrl?: string;
}
interface Product {
  nombre: string;
  descripcion: string;
  imagen_url: string;
}
interface ContainerProps {
  isExpanded: boolean;
}
const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialMessageSent, setInitialMessageSent] = useState(false);

  const toggleChatbot = () => {
    setIsExpanded(!isExpanded);
  
    // Verifica si el chatbot se está expandiendo y si el mensaje inicial aún no se ha enviado
    if (!isExpanded && !initialMessageSent) {
      const welcomeMessage: Message = {
        author: "bot",
        content: "Por favor, indícame qué productos estás buscando: ojos, uñas, rostro, maquillaje o labial.",
      };
  
      // Añade el mensaje de bienvenida a la lista de mensajes y actualiza el estado para indicar que el mensaje inicial ya se envió
      setMessages((prevMessages) => [...prevMessages, welcomeMessage]);
      setInitialMessageSent(true); // Asegúrate de que el mensaje de bienvenida solo se añada una vez
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Añadir el mensaje del usuario a la lista de mensajes
    const userMessage: Message = { author: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post(
        "https://asdasdasd3.onrender.com/api/products/search",
        { query: input }
      );
      const responseData = response.data;

      // Asumiendo que responseData.data es un array de productos
      const botMessages = responseData.data.map((product: Product) => {
        return {
          author: "bot",
          content: `Producto encontrado: ${product.nombre} - ${product.descripcion}`,
          imageUrl: product.imagen_url.startsWith("http")
            ? product.imagen_url
            : `https://asdasdasd3.onrender.com${product.imagen_url}`,
        };
      });

      // Añadir los mensajes del bot a la lista de mensajes
      setMessages((prevMessages) => [...prevMessages, ...botMessages]);
    } catch (error) {
      const errorMessage: Message = {
        author: "bot",
        content: "Hubo un error buscando los productos. Intenta de nuevo.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      console.error(error);
    }

    setInput(""); // Limpiar el campo de entrada
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef]);
  return (
    <>
      {isExpanded ? (
        <Container ref={containerRef} isExpanded={isExpanded}>
          <Header>
            <div>Chatbot</div>
            <ToggleButton onClick={toggleChatbot}>
              <ExpandLessIcon />
            </ToggleButton>
          </Header>
          <MessageList>
            {messages.map((message, index) => (
              <MessageItem key={index} author={message.author}>
                {message.content}
                {message.imageUrl && (
                  <div
                    style={{
                      marginTop: "10px",
                      position: "relative",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <img
                      src={message.imageUrl}
                      alt="Product"
                      style={{
                        width: "100%", // Controla el ancho de la imagen
                        height: "100%", // Controla la altura de la imagen
                        objectFit: "cover", // Asegura que la imagen cubra el contenedor
                        borderRadius: "10px", // Aplica bordes redondeados
                      }}
                    />
                  </div>
                )}
              </MessageItem>
            ))}
          </MessageList>
          <div>
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage}>Enviar</Button>
          </div>
        </Container>
      ) : (
        <ChatIcon onClick={toggleChatbot}>
          <ChatBubbleOutlineIcon />
        </ChatIcon>
      )}
    </>
  );
};

export default Chatbot;

