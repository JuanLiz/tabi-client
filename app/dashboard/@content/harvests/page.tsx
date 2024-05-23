'use client'
import axiosInstance from "@/axiosInterceptor";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Table, TableProps, message } from "antd";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface HarvestResponseExtend extends HarvestTable {
    key: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: HarvestResponseExtend;
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
    const [harvestStates, setHarvestStates] = useState<HarvestState[]>([]);



    const getHarvestStates = async () => {
        const { data } = await axiosInstance.get('/api/HarvestState');
        setHarvestStates(data);
    }

    useEffect(() => {
        getHarvestStates();
    }, []);

    const inputNode =
        inputType === 'number' ? <InputNumber />
            : inputType === 'text'
                ? <Input />
                : <Select loading={harvestStates.length === 0} disabled={harvestStates.length === 0} placeholder="Selecciona un estado">
                    {harvestStates.map((state: HarvestState) => (
                        <Select.Option key={state.harvestStateID} value={state.harvestStateID}>{state.name}</Select.Option>
                    ))}
                </Select>;


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


export default function HarvestsPage() {


    const [createHarvestVisible, setCreateHarvestVisible] = useState<boolean>(false);
    const [createHarvestForm] = Form.useForm();
    const [createHarvestButtonLoading, setCreateHarvestButtonLoading] = useState<boolean>(false);
    const [crops, setCrops] = useState<any[]>([]);
    const [userID, setUserID] = useState<number>(Cookies.get('user') ? JSON.parse(Cookies.get('user') ?? '0').userID : 0);

    // Harvest table related functions and states
    // Farms table
    const [editHarvestForm] = Form.useForm();
    const [harvests, setHarvests] = useState<HarvestResponseExtend[]>([]);
    const [editingKey, setEditingKey] = useState<string>('');

    // Message
    const [messageApi, contextHolder] = message.useMessage();

    const isEditing = (record: HarvestResponseExtend) => record.key === editingKey;

    const edit = (record: Partial<HarvestResponseExtend> & { key: React.Key }) => {
        editHarvestForm.setFieldsValue({
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
            const row = (await editHarvestForm.validateFields());
            const harvestStateID = row.harvestStateName;
            updateHarvest(Number(key), Number(harvestStateID));
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'Cultivo',
            dataIndex: 'lotName',
            editable: false,
        },
        {
            title: 'Fecha de cosecha',
            dataIndex: 'date',
            editable: false,
        },
        {
            title: 'Arrobas cosechadas',
            dataIndex: 'amount',
            editable: false,
            inputType: 'number',
        },
        {
            title: 'Estado',
            dataIndex: 'harvestStateName',
            editable: true,
            inputType: 'select',
        },
        {
            title: '',
            width: '15%',
            dataIndex: 'operation',
            render: (_: any, record: HarvestResponseExtend) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button type="text" onClick={() => save(record.key)} style={{ marginRight: 8 }} icon={<CheckOutlined />} />
                        <Button onClick={() => cancel()} type="text" icon={<CloseOutlined />} danger/>
                    </span>
                ) : (
                    <>
                        <Button type="text" onClick={() => edit(record)} style={{ marginRight: '.3rem' }} disabled={editingKey !== ''} icon={<EditOutlined />} />
                        <Popconfirm
                            icon={<ExclamationCircleFilled style={{ color: '#FF4D4F' }} />}
                            key={record.harvestID}
                            placement="topRight"
                            title="¿Estás seguro de eliminar la cosecha?"
                            description="Esta acción no se puede deshacer."
                            onConfirm={() => deleteHarvest(record.harvestID)}
                            okText="Eliminar registro"
                            okButtonProps={{ danger: true }}
                            cancelText="Cancelar"
                        >
                            <Button type="text" icon={<DeleteOutlined />} danger disabled={isEditing(record)} />
                        </Popconfirm>
                    </>
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
            onCell: (record: HarvestResponseExtend) => ({
                record,
                inputType: col.dataIndex === 'amount'
                    ? 'number' : col.dataIndex === 'harvestStateName'
                        ? 'select' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });



    const getCrops = async () => {
        console.log(userID);
        const { data } = await axiosInstance.get('/api/Crop?Filters=Lot.Farm.UserID%3D%3D' + userID);
        const crops = data.map((crop: CropResponse) => (
            {
                ...crop,
                key: crop.cropID.toString(),
                lotName: `Cultivo ${crop.cropID} - Lote ${crop?.lot?.name}`
            }));
        setCrops(crops);
    }

    const getHarvests = async () => {
        const { data } = await axiosInstance.get('/api/Harvest');
        const harvests = data.map((harvest: HarvestResponseExtend) => (
            {
                ...harvest,
                key: harvest.harvestID.toString(),
                lotName: `Cultivo ${harvest.cropID} - Lote ${harvest?.crop?.lot?.name}`,
                harvestStateName: harvest?.harvestState?.name
            }));
        setHarvests(harvests);
    }

    const createHarvest = async (values: any) => {
        try {
            setCreateHarvestButtonLoading(true);

            const form: FormData = new FormData();
            form.append('CropID', values.cropID);
            form.append('Date', values.date.format('YYYY-MM-DD'));
            form.append('Amount', values.amount);
            form.append('HarvestStateID', '1');
            await axiosInstance.post('/api/Harvest', form);
            getHarvests();
            messageApi.success('Cosecha creada correctamente');
        } catch (error) {
            messageApi.error('Ocurrió un error al crear la cosecha');
            console.error(error);
        } finally {
            setCreateHarvestButtonLoading(false);
            setCreateHarvestVisible(false);
            createHarvestForm.resetFields();
        }
    }

    const updateHarvest = async (harvestID: number, harvestStateID: number) => {
        try {
            const form: FormData = new FormData();
            form.append('HarvestID', harvestID.toString());
            form.append('HarvestStateID', harvestStateID.toString());
            await axiosInstance.put(`/api/Harvest/`, form);
            getHarvests();
            messageApi.success('Estado de la cosecha actualizado correctamente');
        } catch (error) {
            messageApi.error('Ocurrió un error al actualizar la cosecha');
            console.error(error);
        } finally {
            setEditingKey('');
        }
    }

    const deleteHarvest = async (harvestID: number) => {
        try {
            const data = await axiosInstance.delete(`/api/Harvest/${harvestID}`);
            if (data.status === 204) {
                getHarvests();
                messageApi.success('Cosecha eliminada correctamente');
            }
        } catch (error) {
            messageApi.error('Ocurrió un error al eliminar la cosecha');
            console.error(error);
        }
    }

    useEffect(() => {
        getCrops();
        getHarvests();
    }, []);

    useEffect(() => {
        createHarvestForm.resetFields();
    }, [createHarvestVisible]);


    return (
        <div className="w-full flex flex-col gap-4 lg:gap-8">
            {/* Context holder for messages */}
            {contextHolder}
            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Gestión de cosechas</h1>
                <Popconfirm
                    title="Agregar cosecha"
                    open={createHarvestVisible}
                    placement="bottomRight"
                    description={
                        <Form
                            form={createHarvestForm}
                            layout="vertical"
                            onFinish={createHarvest}
                            style={{ margin: '1rem' }}
                        >
                            <Form.Item label="Cultivo" name="cropID" rules={[{ required: true, message: 'Selecciona un cultivo' }]}>
                                <Select placeholder="Selecciona un cultivo" loading={crops.length === 0} disabled={crops.length === 0}>
                                    {crops.map((crop: any) => (
                                        <Select.Option key={crop.cropID} value={crop.cropID}>
                                            <span className="text-wrap">Cultivo {crop.cropID} - Lote {crop?.lot.name}</span>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Fecha de cosecha" name="date" rules={[{ required: true, message: 'Selecciona una fecha' }]}>
                                <DatePicker
                                    className="w-full"
                                    format='DD-MM-YYYY'
                                    placeholder='Selecciona la fecha'
                                    maxDate={dayjs(new Date().toISOString().split('T')[0], 'YYYY-MM-DD')}
                                />
                            </Form.Item>
                            <Form.Item label="Arrobas cosechadas" name="amount" rules={[{ required: true, message: 'Ingresa las arrobas cosechadas' }]}>
                                <Input type="number" />
                            </Form.Item>
                            <div className="w-full flex justify-end gap-2 pt-2">
                                <Button type="default" onClick={() => setCreateHarvestVisible(false)}>Cancelar</Button>
                                <Button type="primary" htmlType="submit" loading={createHarvestButtonLoading}>Agregar</Button>
                            </div>
                        </Form>
                    }
                    icon={null}
                    cancelButtonProps={{ style: { display: 'none' } }}
                    okButtonProps={{ style: { display: 'none' } }}
                    onOpenChange={() => setCreateHarvestVisible(!createHarvestVisible)}
                >
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        style={
                            {
                                padding: '0 2rem',
                                fontWeight: '500'
                            }
                        }
                        onClick={() => setCreateHarvestVisible(!createHarvestVisible)}
                    >Agregar cosecha</Button>
                </Popconfirm>
            </div>

            <Form form={editHarvestForm} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
                    loading={harvests.length === 0}
                    dataSource={harvests}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={{
                        onChange: cancel,
                    }}
                />
            </Form>
        </div>
    );
}