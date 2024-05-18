'use client'
import axiosInstance from "@/axiosInterceptor";
import { Form, Input, InputNumber, Table, TableProps, Typography } from "antd";
import { useEffect, useState } from "react";

interface HarvestResponseExtend extends HarvestResponse {
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


export default function HarvestsPage() {



    // Harvest table related functions and states
    // Farms table
    const [editHarvestForm] = Form.useForm();
    const [harvests, setHarvests] = useState<HarvestResponseExtend[]>([]);
    const [editingKey, setEditingKey] = useState<string>('');

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
            const row = (await editHarvestForm.validateFields()) as HarvestResponseExtend;
            //updateFarm(row);

        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'harvestID',
            width: '1%',
            editable: false,
        },
        {
            title: 'ID Cultivo',
            dataIndex: 'cropID',
            editable: true,
        },
        {
            title: 'Fecha de cosecha',
            dataIndex: 'date',
            editable: true,
        },
        {
            title: 'Arrobas cosechadas',
            dataIndex: 'amount',
            editable: true,
        },
        {
            title: '',
            width: '20%',
            dataIndex: 'operation',
            render: (_: any, record: HarvestResponseExtend) => {
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
            onCell: (record: HarvestResponseExtend) => ({
                record,
                inputType: col.dataIndex === 'hectares' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const getHarvests = async () => {
        const { data } = await axiosInstance.get('/api/Harvest');
        const harvests = data.map((harvest: HarvestResponseExtend) => ({ ...harvest, key: harvest.harvestID.toString() }));
        setHarvests(harvests);
    }

    useEffect(() => {
        getHarvests();
    }, []);



    return (
        <div className="w-full flex flex-col gap-4 lg:gap-8">

            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Gestión de cosechas</h1>
            </div>

            <Form form={editHarvestForm} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
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