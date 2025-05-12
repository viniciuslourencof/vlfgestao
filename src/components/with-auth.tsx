import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const usuarioId = localStorage.getItem("usuario_id");

      if (!usuarioId) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    }, [navigate]);

    if (loading) {
      return <div>Carregando...</div>;
    }

    return <Component {...props} />;
  };
};
