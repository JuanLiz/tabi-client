'use client'

import axiosInstance from "@/axiosInterceptor";
import { PlusOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Form, FormProps, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, TableProps, Tabs, TabsProps, Typography, message } from "antd";
import { AxiosResponse } from "axios";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";


interface FarmResponseExtend extends FarmResponse {
    key: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: FarmResponseExtend;
    index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Por favor, ingresa ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

export default function SettingsPage() {


    const [user, setUser] = useState<any | null>(Cookies.get('user') ? JSON.parse(Cookies.get('user') ?? '') : null);
    const [items, setItems] = useState<TabsProps['items']>();

    // Create farm visible
    const [createFarmForm] = Form.useForm();
    const [createFarmVisible, setCreateFarmVisible] = useState(false);
    const [createFarmButtonLoading, setCreateFarmButtonLoading] = useState(false);

    // Farms table
    const [editFarmForm] = Form.useForm();
    const [farms, setFarms] = useState<FarmResponseExtend[]>([]);
    const [editingKey, setEditingKey] = useState<string>('');

    const isEditing = (record: FarmResponseExtend) => record.key === editingKey;

    const edit = (record: Partial<FarmResponseExtend> & { key: React.Key }) => {
        editFarmForm.setFieldsValue({
            name: '',
            address: '',
            hectares: 0,
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key: React.Key) => {
        try {
            const row = (await editFarmForm.validateFields()) as FarmResponseExtend;
            updateFarm(row);

        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'name',
            width: '25%',
            editable: true,
        },
        {
            title: 'Dirección',
            dataIndex: 'address',
            width: '40%',
            editable: true,
        },
        {
            title: 'Hectáreas',
            dataIndex: 'hectares',
            width: '15%',
            editable: true,
        },
        {
            title: '',
            dataIndex: 'operation',
            render: (_: any, record: FarmResponseExtend) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                            Guardar
                        </Typography.Link>
                        <Typography.Link onClick={() => cancel()} >
                            Cancelar
                        </Typography.Link>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        Editar
                    </Typography.Link>
                );
            },
        },
    ];

    const mergedColumns: TableProps['columns'] = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: FarmResponseExtend) => ({
                record,
                inputType: col.dataIndex === 'hectares' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });


    // Document types
    const [documentTypes, setDocumentTypes] = useState<DocType[]>([]);

    const [userForm] = Form.useForm();

    // Message
    const [messageApi, contextHolder] = message.useMessage();

    // Change password modal
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [changePasswordForm] = Form.useForm();

    //=== API Methods ===//

    // Get user from API
    const getUser = async () => {
        try {
            const { data } = await axiosInstance.get('/api/User/' + user?.userID);
            setUser(data);

            userForm.setFieldsValue({
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

    // Get farms
    const getFarms = async () => {
        try {
            const { data } = await axiosInstance.get('/api/Farm?Filters=UserID%3D%3D' + user?.userID);
            const farmsData: FarmResponseExtend[] = data.map((farm: FarmResponse) => ({
                ...farm,
                key: farm.farmID,
            }));
            setFarms(farmsData);
        } catch (error) {
            console.error('Failed:', error);
        }
    }

    const createFarm = async (values: Farm) => {

        setCreateFarmButtonLoading(true);
        const farmForm: FormData = new FormData();
        farmForm.append('UserID', user?.userID.toString());
        farmForm.append('Name', values.name);
        farmForm.append('Address', values.address);
        farmForm.append('Hectares', values.hectares.toString());

        try {
            const response = await axiosInstance.post('/api/Farm', farmForm);
            if (response.status === 201) {
                messageApi.success('Finca creada correctamente');
                getFarms();
            }
        } catch (error) {
            console.error('Failed:', error);
            messageApi.error('Ocurrió un error al crear la finca');
        } finally {
            setCreateFarmButtonLoading(false);
            setCreateFarmVisible(false);
        }
    }


    const updateFarm = async (values: FarmResponseExtend) => {
        console.log('values:', values);
        const farmForm: FormData = new FormData();
        farmForm.append('FarmID', editingKey.toString());
        farmForm.append('UserID', user?.userID.toString());
        farmForm.append('Name', values.name);
        farmForm.append('Address', values.address);
        farmForm.append('Hectares', values.hectares.toString());

        try {
            const response = await axiosInstance.put('/api/Farm', farmForm);
            if (response.status === 200) {
                setEditingKey('');
                messageApi.success('Información actualizada correctamente');
                getFarms();
            }
        } catch (error) {
            console.error('Failed:', error);
            messageApi.error('Ocurrió un error al actualizar la información');
        }
    }

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
                messageApi.success('Información actualizada correctamente');
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed:', error);
            messageApi.error('Ocurrió un error al actualizar la información');
        }
    }

    const changePassword = async (values: any) => {

        const passwordForm: FormData = new FormData();

        passwordForm.append('UserID', user?.userID.toString());
        passwordForm.append('Password', values.password);

        try {
            const response = await axiosInstance.put('/api/User/', passwordForm);
            console.log('response:', response);
            messageApi.success('Contraseña actualizada correctamente');
        } catch (error) {
            console.error('Failed:', error);
        } finally {
            setChangePasswordModalVisible(false);
            changePasswordForm.resetFields();
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
        getFarms();
        getDocumentTypes();
    }, []);

    // Clean form fields on create farm modal close
    useEffect(() => {
        if (!createFarmVisible) {
            createFarmForm.resetFields();
        }
    }, [createFarmVisible]);


    return (
        <div className="w-full flex flex-col lg:gap-6">
            {/* Context holder for messages */}
            {contextHolder}
            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Configuración</h1>
            </div>

            <div>
                <Tabs defaultActiveKey="1" size="large">
                    <Tabs.TabPane tab="Perfil" key="1">
                        <div className="flex flex-col gap-6 py-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-brown font-bold text-lg">Mi perfil</h2>
                                <div className="flex gap-4 items-center">
                                    <Avatar style={{ verticalAlign: 'middle', }} size={72}>
                                        <span className="text-brown font-semibold text-2xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
                                        <span className="text-brown font-semibold text-2xl">{user?.lastName?.charAt(0)?.toUpperCase()}</span>

                                    </Avatar>
                                    <div>
                                        <h3 className="text-brown text-xl font-semibold ms-0.5">{user?.name} {user?.lastName}</h3>
                                        <p className="text-brown text-sm ms-0.5">{user?.username ? user?.username : user?.email}</p>
                                        <Button
                                            type="link"
                                            size="small"
                                            style={{ padding: 0, margin: 0 }}
                                            onClick={() => setChangePasswordModalVisible(true)}
                                        >
                                            Cambiar contraseña
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">

                                <Form
                                    layout="vertical"
                                    form={userForm}
                                    size="middle"
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
                                            <Button className='w-full mt-5' type="primary" htmlType="submit" size="large">
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
                                                user?.userTypeID === 1 ? (
                                                    <Form.Item label="Documento de identidad" className='md:w-1/2'>
                                                        <Space.Compact className='w-full'>
                                                            <Form.Item
                                                                name='documentTypeID'
                                                                rules={[{ required: user?.userTypeID === 1, message: 'Selecciona el tipo de documento' }]}
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
                                                                rules={[{ required: user?.userTypeID === 1, message: 'Ingresa un número de documento válido' }]}
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
                                                        rules={[{ required: user?.userTypeID === 2, message: 'Por favor, ingresa un nombre de usuario' }]}
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

                                        {user?.userTypeID === 1 && (
                                            <div className='md:flex w-full gap-5'>
                                                <Form.Item
                                                    className='md:w-1/2'
                                                    label="Dirección"
                                                    name="address"
                                                    rules={[{ required: user?.userTypeID === 1, message: 'Por favor, ingresa tu dirección!' }]}
                                                >
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item
                                                    className='md:w-1/2'
                                                    label="Teléfono"
                                                    name="phone"
                                                    rules={[{ required: user?.userTypeID === 1, message: 'Por favor, ingresa tu teléfono!' }]}
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
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Fincas" key="2" disabled={user?.userTypeID === 2}>
                        <div className="flex flex-col gap-6 py-4">
                            <div className="w-full flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-brown font-bold text-lg">Mis fincas</h2>
                                    <p className="text-brown/60 text-sm">Gestiona la información de tus fincas</p>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Popconfirm
                                        open={createFarmVisible}
                                        title="Registra una nueva finca"
                                        placement="left"
                                        description={
                                            <div className="w-full">
                                                <Alert message={<span>Una vez creada, la finca no puede ser borrada. <br /> Verifica la información antes de enviar.</span>} type="warning" showIcon />
                                                <Form
                                                    form={createFarmForm}
                                                    layout="vertical"
                                                    onFinish={createFarm}
                                                    style={{ margin: '1rem' }}
                                                >
                                                    <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingresa un nombre' }]}>
                                                        <Input type="text" />
                                                    </Form.Item>
                                                    <Form.Item label="Dirección" name="address" rules={[{ required: true, message: 'Ingresa una dirección' }]}>
                                                        <Input type="text" />
                                                    </Form.Item>
                                                    <Form.Item label="Hectáreas" name="hectares" rules={[{ required: true, message: 'Ingresa las hectáreas' }]}>
                                                        <Input type="number" />
                                                    </Form.Item>
                                                    <div className="w-full flex justify-end gap-2 pt-2">
                                                        <Button type="default" onClick={() => setCreateFarmVisible(false)}>Cancelar</Button>
                                                        <Button type="primary" htmlType="submit" loading={createFarmButtonLoading}>Enviar</Button>
                                                    </div>
                                                </Form>
                                            </div>
                                        }
                                        icon={null}
                                        cancelButtonProps={{ style: { display: 'none' } }}
                                        okButtonProps={{ style: { display: 'none' } }}
                                        onOpenChange={() => setCreateFarmVisible(!createFarmVisible)}
                                    >
                                        <Button type="primary" size="large" icon={<PlusOutlined />}
                                            style={
                                                {
                                                    padding: '0 2rem',
                                                    fontWeight: '500'
                                                }
                                            }
                                            className="w-full">
                                            Registrar finca
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </div>

                            <Form form={editFarmForm} component={false}>
                                <Table
                                    components={{
                                        body: {
                                            cell: EditableCell,
                                        },
                                    }}
                                    bordered
                                    dataSource={farms}
                                    columns={mergedColumns}
                                    rowClassName="editable-row"
                                    pagination={{
                                        onChange: cancel,
                                    }}
                                />
                            </Form>
                        </div>
                    </Tabs.TabPane>
                </Tabs>
            </div>

            <Modal
                title="Cambiar contraseña"
                open={changePasswordModalVisible}
                onCancel={() => setChangePasswordModalVisible(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    form={changePasswordForm}
                    onFinish={changePassword}
                    className="flex flex-col gap-4"
                >
                    <Form.Item
                        label="Nueva contraseña"
                        name="password"
                        rules={[
                            { required: true, message: 'Ingresa la nueva contraseña' },
                            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                        ]}
                    >
                        <Input type="password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirmar contraseña"
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Confirma la nueva contraseña' },
                            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                                },
                            }),
                        ]}
                    >
                        <Input type="password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Cambiar contraseña
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
}