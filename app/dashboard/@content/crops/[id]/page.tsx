'use client'

import axiosInstance from "@/axiosInterceptor";
import { Breadcrumb, Button, Descriptions, DescriptionsProps, List, Popconfirm, message } from "antd";
import { useEffect, useState } from "react";


import AddCropManagementModal from "@/components/modals/addCropManagementModal/addCropManagementModal";
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { ArrowLeft, Calendar, HomeTwo, Leaves } from '@icon-park/react';
import { AxiosResponse } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

//Images
import UpdateCropModal from "@/components/modals/updateCropModal/updateCropModal";
import FertilizeIcon from '@/public/img/crop-management/bag-seedling.svg';
import PlagueControlIcon from '@/public/img/crop-management/bugs.svg';
import HarvestIcon from '@/public/img/crop-management/coffee-beans.svg';
import PlantIcon from '@/public/img/crop-management/hand-holding-seeding.svg';
import WateringIcon from '@/public/img/crop-management/raindrops.svg';
import PlowIcon from '@/public/img/crop-management/shovel.svg';

export default function CropsIdPage({ params }: { params: { id: string } }) {

    const router = useRouter();

    const icons = [
        PlowIcon,
        PlantIcon,
        WateringIcon,
        HarvestIcon,
        FertilizeIcon,
        PlagueControlIcon
    ]

    const cropId = params.id;

    const [crop, setCrop] = useState<CropResponse>();
    const [cropManagement, setCropManagement] = useState<CropManagementResponse[]>();
    const [cropManagementTypes, setCropManagementTypes] = useState<CropManagementType[]>();

    const [descriptionItems, setDescriptionItems] = useState<DescriptionsProps['items']>();
    const [cropManagementItems, setCropManagementItems] = useState<DescriptionsProps['items']>();

    //Update crop modal visibility
    const [updateCrop, setUpdateCrop] = useState(false);
    const [isCropUpdated, setIsCropUpdated] = useState(false);

    // Add crop management visibility
    const [addCropManagement, setAddCropManagement] = useState(false);
    const [isCropManagementAdded, setIsCropManagementAdded] = useState(false);

    // Message
    const [messageApi, contextHolder] = message.useMessage();

    //=== API Methods ===//
    const getCrop = async () => {
        try {
            const response: AxiosResponse<CropResponse> = await axiosInstance.get(`/api/Crop/${cropId}`);
            setCrop(response.data);
            setDescriptionItems([
                {
                    key: '1',
                    label: 'Variedad',
                    children: response.data.cropType?.name,
                },
                {
                    key: '2',
                    label: 'Rendimiento esperado',
                    children: `${response.data.cropType?.expectedYield} kg/planta`,
                },
                {
                    key: '6',
                    label: 'Estado',
                    children: response.data.cropState?.name
                },
                {
                    key: '3',
                    label: 'Fecha de siembra',
                    children: response.data.plantingDate.toLocaleString(
                        'es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                },
                {
                    key: '4',
                    label: 'Fecha de cosecha',
                    children: response.data.harvestDate ? response.data.harvestDate.toLocaleString(
                        'es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'No cosechado',
                },
                {
                    key: '5',
                    label: 'Área cultivada',
                    children: `${response.data.hectares} hectáreas`,
                },
            ]);
        } catch (error) {
            console.error(error);
        }
    }

    const deleteCrop = async () => {
        try {
            const response: AxiosResponse = await axiosInstance.delete(`/api/Crop/${cropId}`);
            if (response.status === 204) {
                message.success('Cultivo eliminado correctamente');
                router.back();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getCropManagementTypes = async () => {
        try {
            const response: AxiosResponse<CropManagementType[]> = await axiosInstance.get(`/api/CropManagementType`);
            setCropManagementTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const getCropManagement = async () => {
        try {
            const response: AxiosResponse<CropManagementResponse[]> = await axiosInstance.get(`/api/CropManagement?Filters=CropID%3D%3D${cropId}`);
            setCropManagement(response.data.reverse());
            setCropManagementItems(response.data.map((cm, index) => {
                return {
                    key: index.toString(),
                    label: cm.cropManagementType?.name,
                    children: cm.description,
                }
            }).reverse());
        } catch (error) {
            console.error(error);
        }
    }

    const createCropManagement = async (values: any) => {
        try {
            const data: FormData = new FormData();

            data.append('cropID', cropId);
            data.append('date', values.date.format('YYYY-MM-DD'));
            data.append('description', values.description);

            const response: AxiosResponse<CropManagementResponse> = await axiosInstance.post(`/api/CropManagement`, data);
            if (response.status === 201) getCropManagement();
        } catch (error) {
            console.error(error);
        }
    }

    const deleteCropManagement = async (cropManagementID: number) => {
        try {
            const response: AxiosResponse = await axiosInstance.delete(`/api/CropManagement/${cropManagementID}`);
            if (response.status === 204) getCropManagement();
        } catch (error) {
            console.error(error);
        }
    }


    //== Use Effects ==//
    useEffect(() => {
        getCrop();
    }, [])

    // Get crop management when crop is ready
    useEffect(() => {
        getCropManagement();
        getCropManagementTypes();
    }, [crop])

    // Refresh crop management list when a new crop management is added
    useEffect(() => {
        if (isCropManagementAdded) {
            getCropManagement();
            messageApi.success('Gestión registrada correctamente');
            setIsCropManagementAdded(false);
        }
    }, [isCropManagementAdded])

    // Refresh page if crop is updated
    useEffect(() => {
        if (isCropUpdated) {
            getCrop();
            messageApi.success('Cultivo actualizado correctamente');
            setIsCropUpdated(false);
        }
    }, [isCropUpdated])



    return (
        <div className="w-full flex flex-col gap-6 lg:gap-10">
            {/* Context holder for messages */}
            {contextHolder}
            <div className="flex flex-col w-full gap-3">
                <Breadcrumb
                    items={[
                        {
                            href: '/dashboard',
                            title: (
                                <div className="flex gap-2 items-center">
                                    <HomeTwo theme="outline" size="14px" fill="rgb(65 47 38 / 0.5)" />
                                </div>
                            )
                        },
                        {
                            href: '/dashboard/crops',
                            title: (
                                <div className="flex gap-2 items-center">
                                    <Leaves theme="outline" size="14px" fill="rgb(65 47 38 / 0.5)" />
                                    <span className="text-brown/50">Cultivos</span>
                                </div>
                            ),
                        },
                        {
                            title: (
                                <div className="flex gap-2 items-center">
                                    <span className="text-brown/50">Cultivo #{crop?.cropID}</span>
                                </div>
                            )
                        },
                    ]}
                />
                <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                    <div className="flex gap-2 items-center">
                        <ArrowLeft className="cursor-pointer" theme="outline" size="24" fill="rgb(65 47 38 / 0.5)" onClick={() => router.back()} />
                        <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Cultivo #{crop?.cropID}</h1>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap gap-2">
                        <Button type="default" size="large" icon={<EditOutlined />} block onClick={() => setUpdateCrop(true)}>
                            <span>Editar información</span>
                        </Button>
                        <Popconfirm
                            icon={<ExclamationCircleFilled style={{ color: '#FF4D4F' }} />}
                            placement="bottomRight"
                            title={`¿Eliminar cultivo #${crop?.cropID}?`}
                            description="Esta acción no se puede deshacer."
                            onConfirm={() => deleteCrop()}
                            okText='Eliminar cultivo'
                            okButtonProps={{ danger: true }}
                            cancelText="Cancelar"
                        >
                            <Button type="default" size="large" icon={<DeleteOutlined />} block danger>
                                <span>Eliminar cultivo</span>
                            </Button>
                        </Popconfirm>
                    </div>
                </div>
            </div>

            <div className="w-full flex p-4 lg:p-8 rounded-lg border border-brown/20 bg-brown-100/40">
                <Descriptions title={null} items={descriptionItems} />
            </div>

            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h2 className="text-brown text-xl lg:text-2xl font-bold">Gestión del cultivo</h2>
                <Button type="primary" size="large" onClick={() => setAddCropManagement(true)}
                    icon={<PlusOutlined />} style={{ padding: '0 2rem' }}>
                    <span>Registrar actividad</span>
                </Button>
            </div>

            <div>
                <List
                    loading={cropManagement === undefined}
                    itemLayout="horizontal"
                    bordered
                    dataSource={cropManagement}
                    renderItem={(item, index) => (
                        <List.Item
                            key={index}
                            actions={[
                                <Popconfirm
                                    icon={<ExclamationCircleFilled style={{ color: '#FF4D4F' }} />}
                                    placement="topRight"
                                    title="¿Estás seguro de eliminar este registro?"
                                    description="Esta acción no se puede deshacer."
                                    onConfirm={() => deleteCropManagement(item.cropManagementID)}
                                    okText="Eliminar registro"
                                    okButtonProps={{ danger: true }}
                                    cancelText="Cancelar"
                                >
                                    <Button type="text" icon={<DeleteOutlined />} danger />
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Image className="pt-1" src={icons[item.cropManagementTypeID - 1]} alt="Crop Management Icon" width={24} height={24} />}
                                title={
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="font-bold">{item.cropManagementType?.name}</span>
                                        <div className="flex gap-1 items-center rounded-full border border-green bg-green-900/20 px-2 py-0.5">
                                            <Calendar theme="filled" size="14" fill="#63A91F" />
                                            <p className="text-green font-bold text-xs tracking-wider">
                                                {item.date.toLocaleString(
                                                    'es-CO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                }
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <AddCropManagementModal
                crop={crop}
                visible={addCropManagement}
                setVisible={setAddCropManagement}
                setIsCropManagementAdded={setIsCropManagementAdded}
            />

            {
                crop && (
                    <UpdateCropModal
                        crop={crop}
                        visible={updateCrop}
                        setVisible={setUpdateCrop}
                        setIsCropUpdated={setIsCropUpdated}
                    />
                )
            }

        </div>
    )
}