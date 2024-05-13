'use client'

import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

// Images
import axiosInstance from '@/axiosInterceptor';
import Logo from '@/public/img/tabi-logo.svg';
import { DownOne, HomeTwo, Sort, User } from '@icon-park/react';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown } from 'antd';
import { AxiosResponse } from 'axios';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


export default function TopBar() {

    const pathname = usePathname()

    // User state
    const [user, setUser] = useState<AuthResponse | null>(null);

    const [farms, setFarms] = useState<FarmResponse[] | null>([]);


    //=== API Methods ===//
    const getFarms = async () => {
        try {
            const res: AxiosResponse<FarmResponse[]> = await axiosInstance.get("/api/Farm?Filters=UserID%3D%3D" + user?.userID);
            console.log(res.data);
            setFarms(res.data);
            if (res.data.length > 0 && !Cookies.get('current_farm_id'))
                Cookies.set("current_farm_id", res.data[0].farmID.toString());
        } catch (err) {
            console.log(err);
        }
    }

    const setCurrentFarm = (farmID: number) => {
        Cookies.set("current_farm_id", farmID.toString());
    }

    const logout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        window.location.href = "/login";
    }


    //=== UseEffects ===//
    useEffect(() => {
        // Set user cookies
        const userCookie = Cookies.get("user");
        if (userCookie) setUser(JSON.parse(userCookie));
    }, []);

    useEffect(() => {
        console.log('From TopBar', user);
        if (user) getFarms();
    }, [user]);


    // Dropdown menu items
    const items: MenuProps['items'] = [
        {
            key: '0',
            label: 'Perfil',
            onClick: () => console.log('Profile')
        },
        {
            key: '1',
            label: 'Cerrar sesión',
            onClick: () => logout()
        }
    ];


    return (
        <header className="w-full flex justify-between items-center px-8 py-4 bg-green-300 lg:bg-white text-brown border-b border-brown/15  ">
            <div className='flex gap-4 lg:gap-8 items-center'>
                <div className='lg:hidden'>
                    <Image src={Logo} alt="Tabi Logo" height={28} />
                </div>
                <div className={`${pathname === '/onboarding' ? 'hidden lg:flex' : 'hidden'}`}>
                    <Image src={Logo} alt="Tabi Logo" height={40} />
                </div>

                {/* Farm dropdown */}
                {
                    user && farms && user.userTypeID === 1 && farms.length > 0 &&
                    (
                        <Dropdown menu={{
                            items: farms?.map(farm => {
                                return {
                                    key: farm.farmID.toString(),
                                    label: farm.name,
                                    onClick: () => setCurrentFarm(farm.farmID)
                                }
                            }),
                            selectable: true,
                            defaultSelectedKeys: [Cookies.get('current_farm_id') || farms[0].farmID.toString()]
                        }}

                            trigger={['click']}>
                            <button className="flex items-center justify-between gap-2 lg:py-2 lg:px-4 rounded-lg lg:border border-brown/20 hover:bg-green-300  ">
                                <HomeTwo theme="outline" size="20" fill="#412F26" />
                                <span className='text-md font-semibold hidden lg:flex'>{farms?.find(farm => farm.farmID.toString() === Cookies.get('current_farm_id'))?.name}</span>
                                <Sort theme='filled' size="1rem" fill="#412F26" />
                            </button>
                        </Dropdown>
                    )
                }
            </div>

            <div className='flex gap-2 lg:gap-4'>
                {/* Account dropdown */}
                <Dropdown menu={{ items }} trigger={['click']}>
                    <button className="flex items-center justify-between gap-2 lg:py-2 lg:px-4 rounded-lg border-brown/20 hover:bg-brown/10  ">
                        <div className='flex items-center gap-2'>
                            <div className='lg:hidden'>
                                <Avatar style={
                                    {
                                        backgroundColor: '#00000000',
                                        verticalAlign: 'middle',
                                    }
                                }
                                >
                                    <User theme="outline" size="1.25rem" fill="#412F26" />

                                </Avatar>
                            </div>
                            <div className='hidden lg:flex'>
                                <Avatar style={
                                    {
                                        backgroundColor: '#ADE679',
                                        verticalAlign: 'middle',
                                        padding: '1.1rem',
                                    }
                                }
                                >
                                    <User theme="outline" size="1.25rem" fill="#412F26" />

                                </Avatar>
                            </div>
                            <span className='hidden md:flex font-extrabold'>{user?.name}</span>
                            <DownOne theme='filled' size="1rem" fill="#412F26" />
                        </div>
                    </button>
                </Dropdown>
            </div>

        </header>
    )
}