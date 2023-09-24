import React, { useState, useEffect } from "react";
import "./stylesLogin.css";
import { BeatLoader } from "react-spinners";
import {
  useAppSelector,
  useAppDispatch,
} from "../../../../redux/store/appHooks";
import { RootState } from "../../../../redux/store/rootReducer";
import {
  loginUser,
  registerUser,
  verifyToken,
} from "../../../../redux/authSlice/authThunks";
import {
  openLoginModal,
  closeLoginModal,
} from "../../../../redux/loginModalSlice/loginModalSlice";
import {
  setLoginMessage,
  setLoginError,
  clearMessages,
  setLoading,
} from "../../../../redux/messagesSlice/messagesSlice";
import { logout } from "../../../../redux/authSlice/authSlice";
interface AdminLoginProps {
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const isLoginModalOpen = useAppSelector(
    (state: RootState) => state.loginModal.isLoginModalOpen
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.messages.isLoading
  );
  const loginMessage = useAppSelector(
    (state: RootState) => state.messages.loginMessage
  );
  const loginError = useAppSelector(
    (state: RootState) => state.messages.loginError
  );

  const [isSignUp, setIsSignUp] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setUsername("");
    setPassword("");
    setEmail("");
    dispatch(clearMessages());
  }, [dispatch]);
  const handleModalClose = () => {
    dispatch(closeLoginModal());
    setUsername("");
    setPassword("");
    setEmail("");
    dispatch(clearMessages());
  };
  const handleSignInClick = () => setIsSignUp(false);
  const handleSignUpClick = () => setIsSignUp(true);
  useEffect(() => {
    if (loginMessage) {
      if (loginMessage === "Registro exitoso") {
        setIsSignUp(false);
      } else if (loginMessage === "Inicio de sesión exitoso") {
        setTimeout(() => {
          handleModalClose(); 
          dispatch(setLoading(false)); 
        }, 2000);
      }
    }
  }, [loginMessage, dispatch]);

  const handleSubmitSignIn = (username: string, password: string) => {
    dispatch(loginUser({ username, password }))
    .then((action) => {
      if (loginUser.fulfilled.match(action)) {
        dispatch(setLoginMessage("Inicio de sesión exitoso"));
        setIsDropdownOpen(false);
        if (typeof onSuccess === "function") {
          onSuccess();
        }
      }
    })
    .catch(() => {
      dispatch(setLoginError("Error al iniciar sesión"));
    });

  };

  const handleSubmitSignUp = (
    username: string,
    password: string,
    email: string
  ) => {
    dispatch(registerUser({ username, password, email }))
      .then((action) => {
        if (registerUser.fulfilled.match(action)) {
          dispatch(setLoginMessage("Registro exitoso"));
          dispatch(setLoginError(null));
        }
      })
      .catch(() => {
        dispatch(
          setLoginError(
            "Error desconocido al registrarse. Por favor, intente nuevamente."
          )
        );
      });
  };

  if (!isLoginModalOpen) return null;
  return (
    <div className="container">
      <div className={`main ${isSignUp ? "sing-up" : "sing-in"}`}>
        <div className="sing-in-form form-container">
          <h1>Sign in</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitSignIn(username, password);
            }}
          >
            <input
              type="text"
              placeholder="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? (
                <BeatLoader size={8} color={"#123abc"} />
              ) : (
                "Iniciar sesión"
              )}
            </button>

            {loginError && <div style={{ color: "red" }}>{loginError}</div>}
            {loginMessage && (
              <div style={{ color: "green" }}>{loginMessage}</div>
            )}
          </form>
        </div>

        <div className="sing-up-form form-container">
          <h1>Sign up</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitSignUp(username, password, email);
            }}
          >
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? (
                <BeatLoader size={8} color={"#123abc"} />
              ) : (
                "Registrarse"
              )}
            </button>

            {loginError && <div style={{ color: "red" }}>{loginError}</div>}
            {loginMessage && (
              <div style={{ color: "green" }}>{loginMessage}</div>
            )}
          </form>
        </div>

        <div className={`sliding-board ${isSignUp ? "" : "sliding"}`}>
          <div className="wide-board">
            <div className={`board sing-in ${isSignUp ? "" : "sliding"}`}>
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button onClick={handleSignInClick} className="board-button">
                Sign in
              </button>
            </div>
            <div className={`board sing-up ${isSignUp ? "sliding" : ""}`}>
              <h1>Helloo, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button onClick={handleSignUpClick} className="board-button">
                Sign up
              </button>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;