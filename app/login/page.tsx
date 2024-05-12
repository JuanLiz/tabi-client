'use client'

import { useAuth } from '@/hooks/useAuth';
import type { FormProps } from 'antd';
import { Alert, Button, Form, Input, Segmented, Select, Space } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Chinese spyware stuff (TikTok icons)
import { GameThree, Leaves } from '@icon-park/react';

// Pattern image
import PatternImg from "@/public/img/pattern-optimized.png";
import Logo from '@/public/img/tabi-logo.svg';


export default function Page() {

    // User types
    const [userTypes, setUserTypes] = useState<UserType[]>([]);

    // Document types
    const [documentTypes, setDocumentTypes] = useState<DocType[]>([]);

    // Operation state (login or register)
    const [operation, setOperation] = useState<'Iniciar sesión' | 'Registrarse'>('Iniciar sesión');

    // User type
    const [userType, setUserType] = useState<UserType>({ userTypeID: 1, name: '' });

    // Loading button states
    const [loginButtonLoading, setLoginButtonLoading] = useState<boolean>(false);
    const [registerButtonLoading, setRegisterButtonLoading] = useState<boolean>(false);

    // Error states
    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    // Visibility
    const [loginErrorVisible, setLoginErrorVisible] = useState<boolean>(false);
    const [registerErrorVisible, setRegisterErrorVisible] = useState<boolean>(false);

    // Use auth hook
    const auth = useAuth();

    // Avoid interceptor 
    const axiosInstance = axios.create();


    // == Types API Functions == //

    // Get user types
    const getUserTypes = async () => {
        try {
            const { data } = await axiosInstance.get('/api/UserType');
            console.log('User types:', data);
            setUserTypes(data);
            // Set default user type as the first one
            setUserType(data[0]);
        } catch (error) {
            console.log('Failed:', error);
        }
    };

    // Get document types
    const getDocumentTypes = async () => {
        try {
            const { data } = await axiosInstance.get('/api/DocumentType');
            const shortNames: { [key: string]: string } = {
                'Cédula de ciudadanía': 'CC',
                'Cédula de extranjería': 'CE',
                'Tarjeta de identidad': 'TI',
                'Pasaporte': 'PA',
            };
            const docTypes = data.map((docType: DocType) => ({
                ...docType,
                shortName: shortNames[docType.name],
            }));
            console.log('Document types:', docTypes);
            setDocumentTypes(docTypes);

        } catch (error) {
            console.log('Failed:', error);
        }
    };


    //== Form functions ==//

    // Authenticate (for both login and after register)
    const authenticate = async (values: AuthRequest) => {

        setLoginButtonLoading(true);
        setRegisterButtonLoading(true);
        const form: FormData = new FormData();
        if (values?.username.includes('@')) {
            form.append('Email', values.username);
        }
        else {
            form.append('Username', values.username);
        }

        form.append('Password', values.password);

        try {
            const data = await axiosInstance.post('/api/Auth/Login', form);
            // Set cookies
            if (data.status === 200) {
                Cookies.set('token', data.data.token);
                Cookies.set('user', JSON.stringify(data.data));
                setLoginButtonLoading(false);
                setRegisterButtonLoading(false);

                setLoginErrorVisible(false);
                setRegisterErrorVisible(false);

                window.location.href = '/dashboard';
            }
        }
        catch (error: any) {
            const data = error.response;
            console.log('Error:', data.status);
            setLoginErrorVisible(true);
            setLoginError(
                data.status === 400
                    ? "Error al iniciar sesión: Usuario o contraseña incorrectos."
                    : "Error al iniciar sesión. Inténtalo de nuevo más tarde."
            );
            setLoginButtonLoading(false);
            setRegisterButtonLoading(false);
        }



    };

    // Login function
    const onFinishLogin: FormProps<AuthRequest>['onFinish'] = async (values) => {

        authenticate({
            username: values.username,
            password: values.password,
        });

    };

    const onFinishLoginFailed: FormProps<AuthRequest>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // Register function
    const onFinishRegister: FormProps<User>['onFinish'] = async (values) => {
        setRegisterButtonLoading(true);

        // Create form data
        const form: FormData = new FormData();
        form.append('Name', values.name);
        form.append('LastName', values.lastName);
        form.append('Email', values.email);
        form.append('Password', values.password);
        form.append('UserTypeID', userType.userTypeID.toString());
        if (values.username) form.append('Username', values.username);
        if (values.documentTypeID) form.append('DocumentTypeID', values.documentTypeID.toString());
        if (values.documentNumber) form.append('DocumentNumber', values.documentNumber);
        if (values.phone) form.append('Phone', values.phone);
        if (values.address) form.append('Address', values.address);

        try {
            // Send request
            const data = await axiosInstance.post('/api/Auth/Register', form);
            setRegisterButtonLoading(false);

            // If user is created, authenticate
            if (data.status === 200) {
                authenticate({
                    username: values.email,
                    password: values.password,
                });
            }

        } catch (error: any) {
            const data = error.response.data;
            console.log('Error:', data.message);
            setRegisterErrorVisible(true);
            setRegisterError(
                data.message === 'Email is already taken'
                    ? 'Ya existe un usuario con este correo electrónico. Intenta iniciar sesión.'
                    : data.message === 'Username is already taken'
                        ? 'Ya existe un usuario con este nombre de usuario. Intenta con otro.'
                        : 'Error al registrarse. Inténtalo de nuevo más tarde.'
            );
            setRegisterButtonLoading(false);
        }


    };

    const onFinishRegisterFailed: FormProps<User>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    //=== UseEffects ===//


    // Load types on component mount
    useEffect(() => {
        getUserTypes();
        getDocumentTypes();
    }, []);

    return (

        <div className="w-screen h-full lg:h-screen flex flex-col-reverse lg:flex-row justify-center lg:items-center">
            <div
                className='w-full lg:w-1/2 h-full  flex flex-col justify-between bg-green-300'
            >

                <div className='w-full hidden lg:flex justify-center items-center lg:justify-start px-16 py-12'>
                    <Image src={Logo} alt='Tabi Logo' />
                </div>

                <div className='h-full mx-8 my-12 lg:m-16 flex flex-col justify-center items-center gap-6'>
                    <p className='text-brown text-2xl lg:text-5xl font-black lg:leading-snug tracking-tight '>
                        Simplifica tus procesos de cultivo de café
                    </p>
                    <p className='text-brown font-regular text-lg lg:text-2xl'>
                        Con Tabi gestionas tu cafetal de manera precisa y eficiente.
                    </p>
                </div>
                <Image src={PatternImg} alt='Pattern' className='' />
            </div>
            <div className='w-full lg:w-1/2 h-full flex flex-col justify-center items-center gap-4 px-6 py-12 lg:p-16'>
                <Segmented
                    size='large'
                    className='w-full'
                    block
                    options={['Iniciar sesión', 'Registrarse']}
                    defaultValue={'Iniciar sesión'}
                    value={operation}
                    onChange={setOperation} />

                <div className='w-full flex flex-col justify-around gap-6 rounded-xl bg-white border-green/20 border px-8 py-14 shadow-lg '>
                    {operation === 'Registrarse' ? (
                        <>
                            <h2 className='text-brown text-2xl font-extrabold'>Regístrate en Tabi</h2>
                            {registerErrorVisible && (
                                <Alert
                                    message={registerError}
                                    type="error"
                                    showIcon
                                    closable
                                    afterClose={() => setRegisterErrorVisible(false)}
                                />
                            )}
                            {
                                userTypes.length > 0 && (
                                    <Segmented
                                        block
                                        className='w-full'
                                        value={userType}
                                        onChange={setUserType}
                                        options={
                                            // Set name and label for each user type
                                            userTypes.map((userType) => ({
                                                key: userType.userTypeID,
                                                userTypeID: userType.userTypeID,
                                                name: userType.name,
                                                value: userType,
                                                label: userType.name === 'Jugador' ? (
                                                    <div className='py-4 flex items-center gap-4'>
                                                        <div className='hidden md:flex '><GameThree theme="outline" size="32" fill="#412F26" /></div>
                                                        <div className='flex flex-col items-start gap-2'>
                                                            <p className='text-wrap text-start font-bold leading-tight'>Quiero jugar a Tabiland </p>
                                                            <p className='text-wrap text-xs text-start text-gray-500'> Juega y aprende sobre el cultivo de café</p>
                                                        </div>
                                                    </div>

                                                ) : userType.name === 'Caficultor'
                                                    ? (
                                                        <div className='py-4 flex items-center gap-4'>
                                                            <div className='hidden md:flex '><Leaves theme="outline" size="32" fill="#412F26" /></div>
                                                            <div className='flex flex-col items-start gap-2'>
                                                                <p className='text-wrap text-start font-bold leading-tight'>Quiero gestionar mis cultivos</p>
                                                                <p className='text-wrap text-xs text-start text-gray-500'>Gestiona tus cultivos de café de manera eficiente</p>
                                                            </div>
                                                        </div>
                                                    )
                                                    : null
                                            }))
                                        }

                                    />
                                )
                            }

                            <Form
                                name="registerForm"
                                layout='vertical'
                                size='middle'
                                onFinish={onFinishRegister}
                                onFinishFailed={onFinishRegisterFailed}
                                className='w-full'
                            >
                                <div className='md:flex w-full gap-5'>
                                    <Form.Item
                                        className='md:w-1/2'
                                        label="Nombres"
                                        name="name"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu nombre!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        className='md:w-1/2'
                                        label="Apellidos"
                                        name="lastName"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu apellido!' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </div>
                                <div className='md:flex w-full gap-5'>
                                    {
                                        userType.name === 'Caficultor' ? (
                                            <Form.Item label="Documento de identidad" className='md:w-1/2'>
                                                <Space.Compact className='w-full'>
                                                    <Form.Item
                                                        name='documentTypeID'
                                                        rules={[{ required: userType.name === 'Caficultor', message: 'Selecciona el tipo de documento' }]}
                                                        className='w-2/5 h-full'
                                                    >
                                                        <Select
                                                            loading={documentTypes.length === 0}
                                                            disabled={documentTypes.length === 0}
                                                            placeholder="Tipo"
                                                        >

                                                            {// Check if doctypes is ready
                                                                documentTypes.length > 0 && (
                                                                    documentTypes.map((docType) => (docType.shortName && (
                                                                        <Select.Option key={docType.documentTypeID} value={docType.documentTypeID}>{docType?.shortName}</Select.Option>
                                                                    )))
                                                                )
                                                            }

                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={'documentNumber'}
                                                        className='w-3/5 h-full'
                                                        rules={[{ required: userType.name === 'Caficultor', message: 'Ingresa un número de documento válido' }]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Space.Compact>
                                            </Form.Item>
                                        ) : (
                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Nombre de usuario"
                                                name="username"
                                                rules={[{ required: userType.name === 'Jugador', message: 'Por favor, ingresa un nombre de usuario' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        )
                                    }

                                    <Form.Item className='md:w-1/2'
                                        label="Correo electrónico"
                                        name="email"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu correo!' },
                                        { type: 'email', message: 'Ingresa un correo válido' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>

                                </div>


                                <Form.Item
                                    label="Contraseña"
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Por favor, ingresa tu contraseña!' },
                                        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                {
                                    userType.name === 'Caficultor' && (
                                        <div className='md:flex w-full gap-5'>
                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Dirección"
                                                name="address"
                                                rules={[{ required: userType.name === 'Caficultor', message: 'Por favor, ingresa tu dirección!' }]}
                                            >
                                                <Input />
                                            </Form.Item>

                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Teléfono"
                                                name="phone"
                                                rules={[{ required: userType.name === 'Caficultor', message: 'Por favor, ingresa tu teléfono!' }]}
                                            >
                                                <Input type='number' maxLength={10} />
                                            </Form.Item>

                                        </div>
                                    )
                                }

                                <Form.Item>
                                    <Button className='w-full mt-5' type="primary" htmlType="submit" loading={registerButtonLoading}>
                                        Registrarse
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    ) :
                        (
                            <>
                                <h2 className='text-brown text-2xl font-extrabold'>Bienvenido a Tabi</h2>
                                {loginErrorVisible && (
                                    <Alert
                                        message={loginError}
                                        type="error"
                                        showIcon
                                        closable
                                        afterClose={() => setLoginErrorVisible(false)}
                                    />
                                )}
                                <Form
                                    name="loginForm"
                                    layout='vertical'
                                    size='large'
                                    onFinish={onFinishLogin}
                                    onFinishFailed={onFinishLoginFailed}
                                    className='w-full'
                                >
                                    <Form.Item
                                        label="Usuario o correo electrónico"
                                        name="username"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu usuario o correo!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Contraseña"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Por favor, ingresa tu contraseña!' },
                                            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button className='w-full mt-5' type="primary" htmlType="submit" loading={loginButtonLoading}>
                                            Iniciar sesión
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </>
                        )
                    }
                </div>
            </div>
        </div >


    );

}