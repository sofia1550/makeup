// hooks/useSocket.tsx
import { useEffect } from "react";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store/rootReducer";
import { logout } from "../../../../redux/authSlice/authSlice";

export const useSocket = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    const socket = io("https://asdasdasd3.onrender.com");

    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
    });

    socket.on(
      "roleRevoked",
      (data: { userId: string | number; roleName: string }) => {
        if (data.userId === userId && data.roleName === "admin") {
          console.log("El rol de admin ha sido revocado.");
          dispatch(logout());
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, dispatch]);
};
