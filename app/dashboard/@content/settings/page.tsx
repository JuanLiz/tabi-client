'use client'

import axiosInstance from "@/axiosInterceptor";
import { Avatar, Button, Form, FormProps, Input, Select, Space, Tabs, TabsProps } from "antd";
import { AxiosResponse } from "axios";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

export default function SettingsPage() {


    const [user, setUser] = useState<any | null>(Cookies.get('user') ? JSON.parse(Cookies.get('user') ?? '') : null);
    const [items, setItems] = useState<TabsProps['items']>();

    // Document types
    const [documentTypes, setDocumentTypes] = useState<DocType[]>([]);

    const [form] = Form.useForm();

    // Message
    const [messageApi, setMessageApi] = useState<string | null>(null);


    //=== API Methods ===//

    // Get user from API
    const getUser = async () => {
        try {
            const { data } = await axiosInstance.get('/api/User/' + user?.userID);
            setUser(data);

            form.setFieldsValue({
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                documentTypeID: data.documentTypeID,
                documentNumber: data.documentNumber,
                phone: data.phone,
                address: data.address,
                username: data.username
            });
        } catch (error) {
            console.error('Failed:', error);
        }
    }

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
            setDocumentTypes(docTypes);

        } catch (error) {
            console.log('Failed:', error);
        }
    };

    // Update user
    const updateUser = async (values: UserResponse) => {

        const userForm: FormData = new FormData();
        userForm.append('UserID', user?.userID.toString());
        userForm.append('Name', values.name);
        userForm.append('LastName', values.lastName);
        userForm.append('Email', values.email);

        if (values.documentTypeID) userForm.append('DocumentTypeID', values.documentTypeID.toString());
        if (values.documentNumber) userForm.append('DocumentNumber', values.documentNumber);
        if (values.phone) userForm.append('Phone', values.phone);
        if (values.address) userForm.append('Address', values.address);
        if (values.username) userForm.append('Username', values.username);


        try {
            const response: AxiosResponse<UserResponse> = await axiosInstance.put('/api/User', userForm);
            if (response.status === 200) {
                Cookies.set('user', JSON.stringify({
                    userID: response.data.userID,
                    token: Cookies.get('token'),
                    email: response.data.email,
                    name: response.data.name,
                    lastName: response.data.lastName,
                    userTypeID: response.data.userTypeID,
                }));
                setUser(response.data);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed:', error);
        }
    }

    const changePassword = async (values: any) => {

        const passwordForm: FormData = new FormData();

        passwordForm.append('UserID', user?.userID.toString() ?? '');
        passwordForm.append('Password', values.password);

        try {
            const response = await axiosInstance.put('/api/User/', values);
            console.log('response:', response);
        } catch (error) {
            console.error('Failed:', error);
        }
    }

    const onFinishForm: FormProps<UserResponse>['onFinish'] = async (values) => {
        console.log('values:', values);
        updateUser(values);
    }

    const onFinishFailedForm: FormProps<UserResponse>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }

    useEffect(() => {
        getUser();
        getDocumentTypes();
    }, []);

    useEffect(() => {
        if (user?.userType) {
            setItems([
                {
                    key: '1',
                    label: <span className="font-semibold">Perfil</span>,
                    children: (
                        <div className="flex flex-col gap-6 py-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-brown font-bold text-lg">Mi perfil</h2>
                                <div className="flex gap-4 items-center">
                                    <Avatar style={{ verticalAlign: 'middle', }} size={72}>
                                        <span className="text-brown font-semibold text-2xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
                                        <span className="text-brown font-semibold text-2xl">{user?.lastName?.charAt(0)?.toUpperCase()}</span>

                                    </Avatar>
                                    <div>
                                        <h3 className="text-brown text-xl font-semibold">{user?.name} {user?.lastName}</h3>
                                        <p className="text-brown text-sm">{user.username ? user.username : user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">

                                <Form
                                    layout="vertical"
                                    form={form}
                                    onFinish={onFinishForm}
                                    onFinishFailed={onFinishFailedForm}
                                    className="flex flex-col gap-4"
                                >

                                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-brown font-bold text-lg">Información general</h2>
                                            <p className="text-brown/60 text-sm">Actualiza tu información personal</p>
                                        </div>
                                        <Form.Item className="hidden lg:flex">
                                            <Button className='w-full mt-5' type="primary" htmlType="submit">
                                                Actualizar información
                                            </Button>
                                        </Form.Item>
                                    </div>

                                    {/* Form after buttons and title */}
                                    <div className="w-full">
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
                                                user.userTypeID === 1 ? (
                                                    <Form.Item label="Documento de identidad" className='md:w-1/2'>
                                                        <Space.Compact className='w-full'>
                                                            <Form.Item
                                                                name='documentTypeID'
                                                                rules={[{ required: user.userTypeID === 1, message: 'Selecciona el tipo de documento' }]}
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
                                                                                <Select.Option key={docType.shortName} value={docType.documentTypeID}>{docType?.shortName}</Select.Option>
                                                                            )))
                                                                        )
                                                                    }

                                                                </Select>
                                                            </Form.Item>
                                                            <Form.Item
                                                                name={'documentNumber'}
                                                                className='w-3/5 h-full'
                                                                rules={[{ required: user.userTypeID === 1, message: 'Ingresa un número de documento válido' }]}
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
                                                        rules={[{ required: user.userTypeID === 2, message: 'Por favor, ingresa un nombre de usuario' }]}
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
                                                <Input type='email' />
                                            </Form.Item>

                                        </div>

                                        {user.userTypeID === 1 && (
                                            <div className='md:flex w-full gap-5'>
                                                <Form.Item
                                                    className='md:w-1/2'
                                                    label="Dirección"
                                                    name="address"
                                                    rules={[{ required: user.userTypeID === 1, message: 'Por favor, ingresa tu dirección!' }]}
                                                >
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item
                                                    className='md:w-1/2'
                                                    label="Teléfono"
                                                    name="phone"
                                                    rules={[{ required: user.userTypeID === 1, message: 'Por favor, ingresa tu teléfono!' }]}
                                                >
                                                    <Input type='number' maxLength={10} />
                                                </Form.Item>
                                            </div>
                                        )}
                                        <Form.Item className="md:hidden w-full">
                                            <Button type="primary" block className='w-full mt-5' htmlType="submit">
                                                Actualizar información
                                            </Button>
                                        </Form.Item>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    )
                },
                {
                    key: '2',
                    disabled: user.userTypeID === 2,
                    label: <span className="font-semibold">Fincas</span>,
                    children: <div>Cultivos</div>,

                }
            ]);
        }
    }, [user, documentTypes])

    return (
        <div className="w-full flex flex-col lg:gap-6">

            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Configuración</h1>
            </div>

            <div>
                <Tabs defaultActiveKey="1" items={items} size="large" />
            </div>

        </div>
    );
}