'use client'

import { Button, Form, FormProps, Input, Skeleton } from 'antd';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Illustration
import axiosInstance from '@/axiosInterceptor';
import CoffeeIllustration from '@/public/img/coffee-farmer.svg';
import TabilandStandard from '@/public/img/tabiland-standard.svg';
import TabilandThinking from '@/public/img/tabiland-thinking.svg';

export default function OnboardingPage() {

    // Button loading hook
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [gameHasFarm, setGameHasFarm] = useState<boolean>();
    const [isGameAccountReady, setIsGameAccountReady] = useState<boolean>();

    // Check if player has a crop (Also should have a lot and farm)
    const checkPlayerLot = async () => {

        if (!user) return;
        console.log("Checking player lot");
        const data = await axiosInstance.get(`/api/Crop?Filters=Lot.Farm.UserID%3D%3D${user.userID}`);
        if (data.data.length > 0) {
            console.log("Player has a crop");
            setGameHasFarm(true);
        } else {
            setGameHasFarm(false);
            setIsGameAccountReady(false);
            SetPlayerAccount();
        }
    }

    // Register farm, lot and crop for players
    const SetPlayerAccount = async () => {
        if (!user) return;

        // Send data to API
        const formFarm: FormData = new FormData();
        formFarm.append('UserID', user.userID.toString());
        formFarm.append('Name', 'Finca de Tabiland');
        formFarm.append('Address', 'Tabiland');
        formFarm.append('Hectares', '10');

        try {
            const resp = await axiosInstance.post("/api/Farm", formFarm);

            if (resp.status === 201) {
                console.log("Farm created", resp.data);
                const formLot: FormData = new FormData();

                // Now try to create a lot
                formLot.append('FarmID', resp.data.farmID.toString());
                formLot.append('Name', 'Lote de Tabiland');
                formLot.append('Hectares', '10');
                formLot.append('SlopeTypeID', '3');
                const res = await axiosInstance.post("/api/Lot", formLot);

                if (res.status === 201) {
                    console.log("Lot created", res.data);
                    const formCrop: FormData = new FormData();

                    // Now try to create a crop
                    formCrop.append('LotID', res.data.lotID.toString());
                    formCrop.append('Hectares', '10');
                    formCrop.append('CropTypeID', '2');
                    formCrop.append('CropStateID', '1');
                    formCrop.append('PlantingDate', new Date().toISOString().split('T')[0]);
                    const res2 = await axiosInstance.post("/api/Crop", formCrop);
                    if (res2.status === 201) {
                        console.log("Crop created", res2.data);
                        setIsGameAccountReady(true);
                    }
                }


            }
        } catch (err) {
            console.log(err);
        }
    }

    // Register farm for farmers
    const OnFinish: FormProps<Farm>['onFinish'] = async (values) => {
        if (!user) return;

        setLoading(true);
        // Send data to API
        const form: FormData = new FormData();
        form.append('UserID', user.userID.toString());
        form.append('Name', values.name);
        form.append('Address', values.address);
        form.append('Hectares', values.hectares.toString());

        try {
            const res = await axiosInstance.post("/api/Farm", form);
            setLoading(false);
            window.location.href = "/dashboard";
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }

    const OnFinishFailed: FormProps<Farm>['onFinishFailed'] = (errorInfo) => {
        console.log(errorInfo);
    }

    //=== UseEffects ===//
    useEffect(() => {
        // Set user cookies
        const userCookie = Cookies.get("user");
        if (userCookie) setUser(JSON.parse(userCookie));

    }, []);

    useEffect(() => {
        console.log(user);
        // Check if player has a crop
        checkPlayerLot();
    }, [user]);


    return (
        <div className="w-screen lg:h-full flex flex-col lg:flex-row justify-center items-center gap-8 p-8">
            <div className={`${user && user.userTypeID === 1 ? 'lg:w-1/2' : 'lg:w-1/4'} h-full flex justify-center items-center`}>
                {user && user.userTypeID === 1
                    ? <Image src={CoffeeIllustration} alt="Coffee Farmer" />
                    : user && user.userTypeID === 2 && (gameHasFarm || isGameAccountReady)
                        ? <Image src={TabilandStandard} alt="Coffee grain illustration" height={400} />
                        : user
                            && user.userTypeID === 2
                            && gameHasFarm !== undefined && isGameAccountReady !== undefined
                            && !gameHasFarm && !isGameAccountReady
                            ? <Image src={TabilandThinking} alt="Coffee grain illustration" height={400} />
                            : <Skeleton.Image
                                style={{ width: 400, height: 400 }} active />
                }
            </div>
            <div className={`lg:w-1/2 flex flex-col gap-12 lg:px-8`}>
                <div className='flex flex-col gap-4'>
                    <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">
                        {user && user.userTypeID === 1 ? 'Empecemos registrando tu finca'
                            : user && user.userTypeID === 2 && (gameHasFarm || isGameAccountReady)
                                ? '¡Tu cuenta para jugar está lista!'
                                : user
                                    && user.userTypeID === 2
                                    && gameHasFarm !== undefined && isGameAccountReady !== undefined
                                    && !gameHasFarm && !isGameAccountReady
                                    ? 'Estamos configurando tu cuenta...'
                                    : <Skeleton.Input block active />
                        }

                    </h1>
                    <div className="text-brown text-sm lg:text-base">
                        {user && user.userTypeID === 1 ? (
                            <>
                                Agrega a continuación los datos de tu finca para comenzar a usar la plataforma.&nbsp;
                                <b>Podrás cambiar la información o agregar más fincas posteriormente.</b>
                            </>)
                            : user && user.userTypeID === 2 && (gameHasFarm || isGameAccountReady)
                                ? (
                                    <>
                                        ¡Ya puedes jugar a Tabiland!&nbsp;
                                        <b>Abre el juego e inicia sesión con esta cuenta.</b>
                                    </>)
                                : user
                                    && user.userTypeID === 2
                                    && gameHasFarm !== undefined && isGameAccountReady !== undefined
                                    && !gameHasFarm && !isGameAccountReady
                                    ? (<>Este proceso sólo tomará un momento</>)
                                    : <Skeleton active className='mx-8 lg:mx-0' />
                        }

                    </div>
                </div>

                {
                    user && user.userTypeID === 1 && (
                        <Form
                            name="onboarding"
                            className="w-full"
                            labelWrap
                            layout='vertical'
                            size='large'
                            onFinish={OnFinish}
                            onFinishFailed={OnFinishFailed}
                        >
                            <Form.Item
                                label="Nombre de la finca"
                                name="name"
                                rules={[{ required: true, message: 'Por favor ingresa el nombre de tu finca' }]}
                            >
                                <Input type="text" />
                            </Form.Item>

                            <Form.Item
                                label="Dirección"
                                name="address"
                                rules={[{ required: true, message: 'Por favor ingresa la dirección de tu finca' }]}
                            >
                                <Input type="text" />
                            </Form.Item>

                            <Form.Item
                                label="Tamaño de la finca en hectáreas"
                                name="hectares"
                                rules={[{ required: true, message: 'Por favor ingresa el tamaño de tu finca' }]}
                            >
                                <Input type="number" />
                            </Form.Item>

                            <Form.Item className='w-full flex lg:justify-end'>
                                <Button type="primary" htmlType="submit" className='w-full lg:w-auto mt-5' loading={loading}>
                                    Registrar
                                </Button>
                            </Form.Item>
                        </Form>
                    )
                }

            </div>
        </div>
    )
}