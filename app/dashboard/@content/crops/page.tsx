'use client'

import axiosInstance from "@/axiosInterceptor";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Edit, MoreOne } from "@icon-park/react";
import { Button, Collapse, CollapseProps, Dropdown, Form, FormProps, Input, Popconfirm, Select, Skeleton } from "antd";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

export default function CropsPage() {

    const [lots, setLots] = useState<LotView[]>();
    const [lotsCollapse, setLotsCollapse] = useState<CollapseProps['items']>();
    const [slopeTypes, setSlopeTypes] = useState<SlopeType[]>();
    const currentFarm = Cookies.get('current_farm_id');

    // Create lot popconfirm
    const [createLotForm] = Form.useForm();
    const [createLotVisible, setCreateLotVisible] = useState<boolean>(false);
    const [createLotButtonLoading, setCreateLotButtonLoading] = useState<boolean>(false);


    const confirm = () =>
        new Promise((resolve) => {
            setTimeout(() => resolve(null), 3000);
        });

    //=== API Methods ==//
    const getLots = async () => {
        setLots(undefined);
        const res = await axiosInstance.get('/api/Lot?Filters=FarmID%3D%3D' + currentFarm);
        if (res.status === 200) {
            // Add crops to lots
            const lotsWithCrops = await Promise.all(res.data.map(async (lot: LotResponse) => {
                const crops = await getCrops(lot.lotID);
                return { ...lot, crops };
            }));

            setLots(lotsWithCrops);
        }
    }

    const getCrops = async (lotID: number) => {
        const res = await axiosInstance.get(`/api/Crop?Filters=LotID%3D%3D${lotID}`);
        if (res.status === 200) return res.data;
    }

    const getSlopeTypes = async () => {
        const res = await axiosInstance.get('/api/SlopeType');
        if (res.status === 200) {
            setSlopeTypes(res.data);
        }
    }

    const createLot = async (lot: Lot) => {
        if (!currentFarm) return;

        setCreateLotButtonLoading(true);
        const createLotData: FormData = new FormData();
        createLotData.append('FarmID', currentFarm);
        createLotData.append('Name', lot.name);
        createLotData.append('Hectares', lot.hectares.toString());
        createLotData.append('SlopeTypeID', lot.slopeTypeID.toString());

        try {
            const res = await axiosInstance.post('/api/Lot', createLotData);
            if (res.status === 201) {
                getLots();
            }
            setCreateLotButtonLoading(false);
            setCreateLotVisible(false);
        } catch (err) {
            console.log(err);
            setCreateLotButtonLoading(false);
        }
    }

    const deleteLot = async (lotID: number) => {
        const res = await axiosInstance.delete('/api/Lot/' + lotID);
        if (res.status === 204) {
            getLots();
        }
    }

    //=== Form Onfinish ===//
    const onCreateLotFinish: FormProps<Lot>['onFinish'] = (values) => {
        createLot(values);
    };

    //=== UseEffects ===//
    useEffect(() => {
        getLots();
        getSlopeTypes();
    }, []);

    // Clean form fieds on create lot modal close
    useEffect(() => {
        if (!createLotVisible) {
            createLotForm.resetFields();
        }
    }, [createLotVisible]);

    // Set collapse items
    useEffect(() => {
        if (!lots) return;
        const items = lots.map(lot => {
            return {
                key: lot.lotID.toString(),
                label: (
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col gap">
                            <p className="text-brown font-semibold">Lote {lot.name}</p>
                            <p className="text-brown font-light text-sm">{`${lot.hectares} hectáreas, Inclinación ${lot.slopeType?.name.toLocaleLowerCase()}`}</p>
                        </div>
                        <div className="flex items-center">
                            {/* Lot edit options*/}
                            <Dropdown menu={{
                                items: [
                                    {
                                        key: '0',
                                        label: 'Editar',
                                        icon: <Edit theme="outline" size="18" fill="#412F26" />,
                                        onClick: () => console.log('Edit')
                                    },
                                    {
                                        key: '1',
                                        danger: true,
                                        label: 'Eliminar',
                                        icon: <DeleteOutlined style={{ fontSize: '115%' }} />,
                                        onClick: () => console.log('Delete')
                                    }
                                ]
                            }}
                            >
                                <button className="text-brown font-semibold p-2 rounded-full hover:bg-brown/10">
                                    <MoreOne theme="outline" size="24" fill="#412F26" />
                                </button>

                            </Dropdown>
                        </div>
                    </div>
                ),
                children: lot.crops.map(crop => {
                    return (
                        <p key={crop.cropID}>
                            {crop.plantingDate.toString()}
                        </p>
                    )
                })
            }
        });

        setLotsCollapse(items);
    }, [lots]);


    return (
        <div className="w-full flex flex-col lg:gap-6">
            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Gestión de cultivos</h1>
                <Popconfirm
                    title="Agregar lote"
                    open={createLotVisible}
                    placement="bottomRight"
                    description={
                        <Form
                            form={createLotForm}
                            layout="vertical"
                            onFinish={onCreateLotFinish}
                            style={{ margin: '1rem' }}
                        >
                            <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Ingresa un nombre' }]}>
                                <Input type="text" />
                            </Form.Item>
                            <Form.Item label="Hectáreas" name="hectares" rules={[{ required: true, message: 'Ingresa las hectáreas' }]}>
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item label="Inclinación" name="slopeTypeID" rules={[{ required: true, message: 'Selecciona la inclinación' }]}>
                                <Select
                                    loading={slopeTypes === undefined}
                                    disabled={slopeTypes === undefined}
                                    placeholder="Selecciona la inclinación">
                                    {
                                        slopeTypes?.map(slope => (
                                            <Select.Option key={slope.name} value={slope.slopeTypeID}>{slope.name}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <div className="w-full flex justify-end gap-2 pt-2">
                                <Button type="default" onClick={() => setCreateLotVisible(false)}>Cancelar</Button>
                                <Button type="primary" htmlType="submit" loading={createLotButtonLoading}>Enviar</Button>
                            </div>
                        </Form>
                    }
                    icon={null}
                    cancelButtonProps={{ style: { display: 'none' } }}
                    okButtonProps={{ style: { display: 'none' } }}
                    onConfirm={confirm}
                    onOpenChange={() => console.log('open change')}
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
                        onClick={() => setCreateLotVisible(!createLotVisible)}
                    >Agregar lote</Button>
                </Popconfirm>

            </div>

            <div className="w-full mt-8">
                {
                    lots !== undefined && lots !== null
                        ? lots.length > 0
                            ? <Collapse items={lotsCollapse} size="large" />
                            : <p>No hay lotes registrados</p>
                        : <div className="flex flex-col gap-4">
                            <Skeleton.Input block active size="large" />
                            <Skeleton.Input block active size="large" />
                            <Skeleton.Input block active size="large" />
                        </div>
                }
            </div>
        </div >
    );
}