'use client'

import axiosInstance from "@/axiosInterceptor";
import { Breadcrumb, Button, Descriptions, DescriptionsProps } from "antd";
import { useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { HomeTwo, Leaves } from '@icon-park/react';
import { AxiosResponse } from "axios";

export default function CropsIdPage({ params }: { params: { id: string } }) {

    const cropId = params.id;

    const [crop, setCrop] = useState<CropResponse>();
    const [descriptionItems, setDescriptionItems] = useState<DescriptionsProps['items']>();


    //=== API CALL ===//
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


    useEffect(() => {
        getCrop();
    }, [])





    return (
        <div className="w-full flex flex-col gap-6 lg:gap-10">
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
                    <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Cultivo #{crop?.cropID}</h1>
                    <div className="flex flex-wrap lg:flex-nowrap gap-2">
                        <Button type="default" size="large" icon={<EditOutlined />} block>
                            <span>Editar información</span>
                        </Button>
                        <Button type="default" size="large" icon={<DeleteOutlined />} block danger>
                            <span>Eliminar cultivo</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full flex p-4 lg:p-8 rounded-lg border border-brown/20 bg-brown-100/40">
                <Descriptions title={null} items={descriptionItems} />
            </div>

            <div className="w-full flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                <h2 className="text-brown text-xl lg:text-2xl font-bold">Gestión del cultivo</h2>
                <Button type="primary" size="large"
                    icon={<PlusOutlined />} style={{ padding: '0 2rem' }}>
                    <span>Registrar actividad</span>
                </Button>
            </div>

        </div>
    )
}