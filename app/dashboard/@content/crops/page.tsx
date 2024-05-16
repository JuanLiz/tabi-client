'use client'

import axiosInstance from "@/axiosInterceptor";
import { DeleteOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Edit, MoreOne, Plus, PlusCross } from "@icon-park/react";
import { Button, Collapse, CollapseProps, Dropdown, Form, FormProps, Input, Popconfirm, Select, Skeleton } from "antd";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

// Image for empty lots
import CropCard from "@/components/cropCard/cropCard";
import CoffeePlanting from '@/public/img/coffee-planting.svg';
import Image from "next/image";
import AddCropModal from "@/components/modals/addCropModal/addCropModal";

export default function CropsPage() {

    const [lots, setLots] = useState<LotView[]>();
    const [lastLotIndex, setLastLotIndex] = useState<number>(0);
    const [lotsCollapse, setLotsCollapse] = useState<CollapseProps['items']>();
    const [slopeTypes, setSlopeTypes] = useState<SlopeType[]>();
    const currentFarm = Cookies.get('current_farm_id');

    // Create lot popconfirm
    const [createLotForm] = Form.useForm();
    const [createLotVisible, setCreateLotVisible] = useState<boolean>(false);
    const [createLotButtonLoading, setCreateLotButtonLoading] = useState<boolean>(false);

    // Edit lot popconfirm
    const [editLotForm] = Form.useForm();
    const [editLotCurrent, setEditLotCurrent] = useState<number>();
    const [editLotVisible, setEditLotVisible] = useState<boolean>(false)

    // Add crop visibility
    const [addCropModal, setAddCropModal] = useState<boolean>(false);
    const [addCropLot, setAddCropLot] = useState<LotResponse>();
    const [isCropAdded, setIsCropAdded] = useState<boolean>(false);


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

    const updateLot = async (lot: LotResponse) => {

        const editLotData: FormData = new FormData();

        editLotData.append('LotID', lot.lotID.toString());
        editLotData.append('Name', lot.name);
        editLotData.append('Hectares', lot.hectares.toString());
        editLotData.append('SlopeTypeID', lot.slopeTypeID.toString());

        try {
            const res = await axiosInstance.put('/api/Lot/', editLotData);
            if (res.status === 200) {
                editLotForm.resetFields();
                getLots();
            }
        } catch (err) {
            console.log(err);
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

    const onEditLotFinish: FormProps<LotResponse>['onFinish'] = (values) => {
        updateLot(values);
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

    // Fill or clean forms for edit lot modal
    useEffect(() => {
        editLotForm.setFieldsValue({
            lotID: lots?.find(lot => lot.lotID === editLotCurrent)?.lotID,
            name: lots?.find(lot => lot.lotID === editLotCurrent)?.name,
            hectares: lots?.find(lot => lot.lotID === editLotCurrent)?.hectares,
            slopeTypeID: lots?.find(lot => lot.lotID === editLotCurrent)?.slopeTypeID
        });
    }, [editLotCurrent, editLotVisible]);

    useEffect(() => {
        if (isCropAdded) {
            getLots();
            setIsCropAdded(false);
        }
    }, [isCropAdded]);

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
                            <p className="text-brown font-light text-sm">
                                {`${lot.hectares} hectáreas, Inclinación ${lot.slopeType?.name.toLocaleLowerCase()}`}
                            </p>
                        </div>
                        <div className="flex items-center">
                            {/* Lot edit options*/}
                            <Dropdown menu={{
                                items: [
                                    {
                                        key: '0',
                                        icon: <Edit theme="outline" size="18" fill="#412F26" />,
                                        label: (
                                            <Popconfirm
                                                title="Editar lote"
                                                placement="bottomRight"
                                                onConfirm={confirm}
                                                description={
                                                    <Form
                                                        form={editLotForm}
                                                        layout="vertical"
                                                        onFinish={onEditLotFinish}
                                                        style={{ margin: '1rem' }}
                                                    >
                                                        <Form.Item name="lotID" hidden>
                                                            <Input type="text" />
                                                        </Form.Item>
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
                                                            <Button type="primary" htmlType="submit">Enviar</Button>
                                                        </div>
                                                    </Form>
                                                }
                                                icon={null}
                                                cancelButtonProps={{ style: { display: 'none' } }}
                                                okButtonProps={{ style: { display: 'none' } }}
                                                onOpenChange={() => { setEditLotCurrent(lot.lotID); setEditLotVisible(!editLotVisible) }}
                                            >
                                                Editar
                                            </Popconfirm>
                                        )
                                    },
                                    {
                                        key: '1',
                                        danger: true,
                                        icon: <DeleteOutlined style={{ fontSize: '115%' }} />,
                                        label: (
                                            <Popconfirm
                                                icon={<ExclamationCircleFilled style={{ color: '#FF4D4F' }} />}
                                                placement="topRight"
                                                title={"¿Eliminar el Lote " + lot.name + "?"}
                                                description="Esta acción no se puede deshacer."
                                                onConfirm={() => deleteLot(lot.lotID)}
                                                okText="Eliminar lote"
                                                okButtonProps={{ danger: true }}
                                                cancelText="Cancelar"
                                            >
                                                Eliminar
                                            </Popconfirm>
                                        )
                                    }
                                ]
                            }}
                            >
                                <button className="text-brown font-semibold p-2 rounded-full hover:bg-brown/10">
                                    <MoreOne theme="outline" size="24" fill="#412F26" />
                                </button>

                            </Dropdown>
                        </div >
                    </div >
                ),
                children: (
                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                        {lot.crops.map(crop => {
                            return (
                                <CropCard key={crop.cropID} crop={crop} />
                            )
                        })}
                        <button
                            key={`add-crop${lot.lotID.toString()}`}
                            onClick={() => { setAddCropModal(true); setAddCropLot(lot) }}
                            className="w-full md:max-w-72 h-full flex justify-center items-center p-10 md:p-12 gap-2 cursor-pointer rounded-lg border-2 border-dashed border-brown/40 hover:-translate-y-0.5 transition-transform duration-150"
                        >
                            <Plus theme="outline" size="24" fill="#412F26" />
                            <p className="text-brown font-semibold">Agregar cultivo</p>
                        </button>
                    </div>
                )
            }
        }).reverse();

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
                                    {slopeTypes?.map(slope => (
                                        <Select.Option key={slope.name} value={slope.slopeTypeID}>{slope.name}</Select.Option>
                                    ))}
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
                    onOpenChange={() => setCreateLotVisible(!createLotVisible)}
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

            <div className="w-full mt-8 overflow-y-visible">
                {
                    lots !== undefined && lots !== null
                        ? lots.length > 0
                            ? <Collapse items={lotsCollapse} size="large" defaultActiveKey={lastLotIndex} />
                            : <div className="w-full flex flex-col items-center gap-2">
                                <Image src={CoffeePlanting} alt="Coffee Planting" className="h-72 md:h-96" />
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <p className="text-brown font-bold text-2xl text-center">No hay lotes registrados</p>
                                    <p className="text-brown font-light text-center">Agrega un lote para comenzar a gestionar tus cultivos</p>
                                </div>

                            </div>
                        : <div className="flex flex-col gap-4">
                            <Skeleton.Input block active size="large" />
                            <Skeleton.Input block active size="large" />
                            <Skeleton.Input block active size="large" />
                        </div>
                }

            </div>

            <AddCropModal
                lot={addCropLot}
                visible={addCropModal}
                setVisible={setAddCropModal}
                setIsCropAdded={setIsCropAdded}
            />

        </div >
    );
}