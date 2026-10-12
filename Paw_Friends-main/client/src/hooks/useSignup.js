import { useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext.jsx'; 

const useSignup = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);   
    const [loading, setLoading] = useState(false); 

    const registerUser = async (values) => {
        // Validar campos requeridos
        if (!values.name || !values.email || !values.password) {
            const errMsg = 'Por favor completa todos los campos';
            setError(errMsg);
            throw new Error(errMsg);
        }

        // Validar que la contraseña y confirmación coincidan
        if (values.password !== values.confirmPassword) {
            const errMsg = 'La contraseña no coincide';
            setError(errMsg);
            throw new Error(errMsg); 
        }

        // Validar longitud de contraseña
        if (values.password.length < 6) {
            const errMsg = 'La contraseña debe tener al menos 6 caracteres';
            setError(errMsg);
            throw new Error(errMsg);
        }

        try {
            setError(null);
            setLoading(true); 
            
            // Preparar datos para enviar al backend
            const dataToSend = {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
                role: values.role || 'user', // Enviar el rol seleccionado
            };

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/register`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend),
                }
            );

            const data = await res.json();

            if (res.status === 201) {
                // Registro exitoso
                message.success(data.message);
                login(data.token, data.user);
                return;
            } else {
                // Manejar el error específico del límite de administradores
                if (data.errorCode === 'ADMIN_LIMIT_EXCEEDED') {
                    const errMsg = 'Ya no se pueden crear más administradores. El límite de 3 administradores ha sido alcanzado.';
                    setError(errMsg);
                    message.error(errMsg);
                    throw new Error(errMsg);
                }

                // Manejar otros errores
                const errMsg = data.message || 'El registro falló';
                setError(errMsg);
                message.error(errMsg);
                throw new Error(errMsg); 
            }

        } catch (error) {
            const errorMessage = error.message || 'Error inesperado en el registro';
            setError(errorMessage);
            
            // No mostrar mensaje de error si ya se mostró
            if (!error.message?.includes('Ya no se pueden crear más administradores')) {
                if (!error.message?.includes('Por favor completa todos los campos') &&
                    !error.message?.includes('La contraseña') &&
                    !error.message?.includes('error inesperado')) {
                    message.error(errorMessage);
                }
            }
            throw error; 
        } finally {
            setLoading(false); 
        }
    };

    return { loading, error, registerUser }; 
};

export default useSignup;