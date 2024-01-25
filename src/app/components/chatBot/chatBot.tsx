import React, { useState } from "react";
import axios from "axios";
import styled from "@emotion/styled";
import Image from "next/image";

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  border: 1px solid #007bff;
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 15px;
  box-sizing: border-box;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
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
  border: 2px solid #007bff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border 0.3s ease;
  color: black;

  &:focus {
    border-color: #0056b3;
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
  background-color: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
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
const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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

  return (
    <Container>
      <MessageList>
        {messages.map((message, index) => (
          <MessageItem key={index} author={message.author}>
            {message.content}
            {message.imageUrl && (
              <div style={{ marginTop: "10px" }}>
                <Image
                  src={message.imageUrl}
                  alt="Product"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    borderRadius: "10px",
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
  );
};

export default Chatbot;
