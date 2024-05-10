'use client'

import { useAuth } from '@/hooks/useAuth';
import type { FormProps } from 'antd';
import { Button, Form, Input, Segmented, Select, Space } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
// Antd icons
import { FilePdfOutlined } from '@ant-design/icons';

export default function Page() {

    // Operation state (login or register)
    const [operation, setOperation] = useState<'Iniciar sesión' | 'Registrarse'>('Iniciar sesión');

    // User type
    const [userType, setUserType] = useState<'Caficultor' | 'Jugador'>('Caficultor');

    // Use auth hook
    const auth = useAuth();

    // Avoid interceptor 
    const axiosInstance = axios.create();


    // Login function
    const onFinishLogin: FormProps<AuthRequest>['onFinish'] = async (values) => {
        try {
            const form: FormData = new FormData();
            if (values?.userName.includes('@')) {
                form.append('Email', values.userName);
            }
            else {
                form.append('UserName', values.userName);
            }

            form.append('Password', values.password);

            const { data }: { data: AuthResponse } = await axiosInstance.post('/api/Auth/Login', form);

            console.log('Success:', data);

            // Set cookies
            Cookies.set('token', data.token);
            Cookies.set('user', JSON.stringify(data));

            window.location.href = '/dashboard';

        } catch (error) {
            console.log('Failed:', error);
        }

    };

    const onFinishLoginFailed: FormProps<AuthRequest>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    // UseEffect for log the current user type
    useEffect(() => {
        console.log('User type:', userType);
    }, [userType]);

    return (

        <div className="w-screen h-full lg:h-screen flex flex-col-reverse lg:flex-row justify-center lg:items-center">
            <div
                className='w-full lg:w-1/2 h-full px-8 py-12 lg:p-16 flex flex-col justify-center gap-6 bg-green-300'
            >
                <p className='text-brown text-2xl lg:text-5xl font-extrabold lg:leading-snug'>
                    Simplifica tus procesos de cultivo de café
                </p>
                <p className='text-brown font-regular text-lg lg:text-2xl'>
                    Con Tabi gestionas tu cafetal de manera precisa y eficiente.
                </p>
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

                            <Segmented
                                block
                                className='w-full'
                                value={userType}
                                onChange={setUserType}
                                options={[
                                    {
                                        label: (
                                            <div className='py-4 flex items-center gap-4'>
                                                <div className='hidden md:flex '><FilePdfOutlined className='text-4xl' /></div>
                                                <div className='flex flex-col items-start gap-2'>
                                                    <p className='text-wrap text-start font-bold leading-tight'>Quiero gestionar mis cultivos</p>
                                                    <p className='text-wrap text-xs text-start text-gray-500'>Gestiona tus cultivos de café de manera eficiente</p>
                                                </div>
                                            </div>
                                        ),
                                        value: 'Caficultor',
                                    },
                                    {
                                        label: (
                                            <div className='py-4 flex items-center gap-4'>
                                                <div className='hidden md:flex '><FilePdfOutlined className='text-4xl' /></div>
                                                <div className='flex flex-col items-start gap-2'>
                                                    <p className='text-wrap text-start font-bold leading-tight'>Quiero jugar a Tabiland </p>
                                                    <p className='text-wrap text-xs text-start text-gray-500'> Juega y aprende sobre el cultivo de café</p>
                                                </div>
                                            </div>
                                        ),
                                        value: 'Jugador',
                                    },
                                ]}
                            />

                            <Form
                                name="registerForm"
                                layout='vertical'
                                size='middle'
                                initialValues={{ remember: true }}
                                onFinish={onFinishLogin}
                                onFinishFailed={onFinishLoginFailed}
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
                                        userType === 'Caficultor' ? (
                                            <Form.Item label="Documento de identidad" className='md:w-1/2'>
                                                <Space.Compact className='w-full'>
                                                    <Form.Item
                                                        name={['document', 'type']}
                                                        rules={[{ required: userType === 'Caficultor', message: 'Selecciona el tipo de documento' }]}
                                                        className='w-2/5 h-full'
                                                    >
                                                        <Select placeholder="Tipo">
                                                            <Select.Option value="cc">CC</Select.Option>
                                                            <Select.Option value="ce">CE</Select.Option>
                                                            <Select.Option value="ti">TI</Select.Option>

                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={['document', 'number']}
                                                        className='w-3/5 h-full'
                                                        rules={[{ required: userType === 'Caficultor', message: 'Ingresa un número de documento válido' }]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Space.Compact>
                                            </Form.Item>
                                        ) : (
                                            // TODO Debouncing to check username availability
                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Nombre de usuario"
                                                name="birthDate"
                                                rules={[{ required: userType === 'Jugador', message: 'Por favor, ingresa un nombre de usuario' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        )
                                    }


                                    <Form.Item className='md:w-1/2'
                                        label="Correo electrónico"
                                        name="email"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu correo!' }]}
                                    >
                                        <Input />
                                    </Form.Item>


                                </div>


                                <Form.Item
                                    label="Contraseña"
                                    name="password"
                                    rules={[{ required: true, message: 'Por favor, ingresa tu contraseña!' }]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                {
                                    userType === 'Caficultor' && (
                                        <div className='md:flex w-full gap-5'>
                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Dirección"
                                                name="address"
                                                rules={[{ required: userType === 'Caficultor', message: 'Por favor, ingresa tu dirección!' }]}
                                            >
                                                <Input />
                                            </Form.Item>

                                            <Form.Item
                                                className='md:w-1/2'
                                                label="Teléfono"
                                                name="phone"
                                                rules={[{ type: 'number', required: userType === 'Caficultor', message: 'Por favor, ingresa tu teléfono!' }]}
                                            >
                                                <Input />
                                            </Form.Item>

                                        </div>
                                    )
                                }

                                <Form.Item>
                                    <Button className='w-full mt-5' type="primary" htmlType="submit">
                                        Registrarse
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    ) :
                        (
                            <>
                                <h2 className='text-brown text-2xl font-extrabold'>Bienvenido a Tabi</h2>
                                <Form
                                    name="loginForm"
                                    layout='vertical'
                                    size='large'
                                    initialValues={{ remember: true }}
                                    onFinish={onFinishLogin}
                                    onFinishFailed={onFinishLoginFailed}
                                    className='w-full'
                                >
                                    <Form.Item
                                        label="Usuario o correo electrónico"
                                        name="userName"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu usuario o correo!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Contraseña"
                                        name="password"
                                        rules={[{ required: true, message: 'Por favor, ingresa tu contraseña!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button className='w-full mt-5' type="primary" htmlType="submit">
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