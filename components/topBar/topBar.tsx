'use client'

import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

// Images
import axiosInstance from '@/axiosInterceptor';
import Logo from '@/public/img/tabi-logo.svg';
import { DownOne, User } from '@icon-park/react';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown } from 'antd';
import { AxiosResponse } from 'axios';
import Image from 'next/image';

export default function TopBar() {

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
        if (userCookie) {
            setUser(JSON.parse(userCookie));
            console.log('From TopBar', user);
        }

        // Get user farms
        if (user) getFarms();

    }, []);


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
        <header className="sticky top-0 z-1 w-full flex justify-between items-center px-8 py-4 bg-green-300/20 lg:bg-white text-brown border border-b border-brown/15  ">
            <div>
                <Image src={Logo} alt="Tabi Logo" height={30} />
            </div>

            <div>
                <Dropdown menu={{ items }} trigger={['click']}>
                    <button className="flex items-center justify-between gap-2 p-2 px-4 rounded-lg border-0 hover:bg-brown/10  ">
                        <div className='flex items-center gap-2'>
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
                            <span className='font-extrabold'>{user?.name}</span>
                            <DownOne theme='filled' size="1rem" fill="#412F26" />   
                        </div>
                        

                    </button>
                </Dropdown>
            </div>

        </header>
    )
}