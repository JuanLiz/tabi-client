'use client'

import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

// Images
import axiosInstance from '@/axiosInterceptor';
import Logo from '@/public/img/tabi-logo.svg';
import { DownOne, HamburgerButton, HomeTwo, Sort, User } from '@icon-park/react';
import type { MenuProps } from 'antd';
import { Avatar, Drawer, Dropdown, Skeleton } from 'antd';
import { AxiosResponse } from 'axios';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import NavBar from '../navBar/navBar';


export default function TopBar() {

    const pathname = usePathname()

    // User state
    const [user, setUser] = useState<AuthResponse | null>(null);

    const [farms, setFarms] = useState<FarmResponse[] | null>([]);

    const [currentFarm, setCurrentFarm] = useState<number>(Cookies.get('current_farm_id') ? parseInt(Cookies.get('current_farm_id') || '-1') : 0);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const [reload, setReload] = useState<boolean>(false);


    //=== API Methods ===//
    const getFarms = async () => {
        try {
            const res: AxiosResponse<FarmResponse[]> = await axiosInstance.get("/api/Farm?Filters=UserID%3D%3D" + user?.userID);
            setFarms(res.data);
            // Check if current farm saved in cookies is in the list
            if (!res.data.find(farm => farm.farmID === currentFarm)) {
                console.log('Current farm not found in list');
                setCurrentFarm(res.data[0].farmID);
            }

        } catch (err) {
            console.log(err);
        }
    }

    const setFarm = (farmID: number) => {
        setCurrentFarm(farmID);
        window.location.reload();
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

        // setCurrentFarm(parseInt(Cookies.get('current_farm_id') || '0'));
    }, []);

    useEffect(() => {
        console.log('From TopBar', user);
        if (user) getFarms();
    }, [user]);

    useEffect(() => {
        Cookies.set("current_farm_id", currentFarm.toString());
    }, [currentFarm]);


    // Dropdown menu items
    const items: MenuProps['items'] = [
        {
            key: 'name',
            label: (<span className='text-brown font-bold'>{user?.name + ' ' + user?.lastName}</span>),
            disabled: true,
        },
        {
            key: 'divider',
            type: 'divider',
        },
        {
            key: '0',
            label: 'Perfil',
            onClick: () => user?.userTypeID === 1 ? window.location.href = '/dashboard/settings' : window.location.href = '/settings'
        },
        {
            key: '1',
            label: 'Cerrar sesión',
            onClick: () => logout()
        }
    ];


    return (
        <header className="sticky top-0 w-full flex justify-between items-center px-4 lg:px-8 py-4 bg-green-300 lg:bg-white text-brown border-b border-brown/15  ">
            <div className='flex gap-4 lg:gap-8 items-center'>
                <div className='lg:hidden flex gap-2 items-center'>
                    <button className='px-1' onClick={() => setMenuOpen(!menuOpen)}>
                        <HamburgerButton theme="outline" size="24" fill="#412F26" />
                    </button>
                    <Image src={Logo} alt="Tabi Logo" height={28} />
                </div>
                <div className={`${pathname === '/onboarding' || pathname === '/settings' ? 'hidden lg:flex' : 'hidden'}`}>
                    <Image src={Logo} alt="Tabi Logo" height={40} />
                </div>

                {/* Farm dropdown */}
                {
                    user && farms && farms.length > 0 && user.userTypeID === 1 && pathname !== '/onboarding'
                        && pathname !== '/settings' ?
                        <Dropdown menu={{
                            items: [
                                {
                                    key: 'name',
                                    label: (<span className='text-brown'> <b>Selección de fincas</b> <br />Puedes agregar más fincas o modificarlas <br /> en la sección de configuración.</span>),
                                    disabled: true,
                                },
                                {
                                    type: 'divider',
                                    key: 'divider',
                                },
                            ].concat(
                                farms?.map(farm => {
                                    return {
                                        key: farm.farmID.toString(),
                                        label: (<>{farm.name}</>),
                                        disabled: false, // Add the disabled property here
                                        onClick: () => { setFarm(farm.farmID) },
                                    }
                                })
                            ),
                            selectable: true,
                            defaultSelectedKeys: [currentFarm.toString() || farms[0].farmID.toString()]
                        }}
                            className='hidden lg:flex'
                            trigger={['click']}>
                            <button className="flex items-center justify-between gap-2 lg:py-2 lg:px-4 rounded-lg lg:border border-brown/20 hover:bg-brown-100/40 ">
                                <HomeTwo theme="outline" size="20" fill="#412F26" />
                                <span className='text-md font-semibold hidden lg:flex'>{farms?.find(farm => farm.farmID === currentFarm)?.name}</span>
                                <Sort theme='filled' size="1rem" fill="#412F26" />
                            </button>
                        </Dropdown>
                        : user && farms && user.userTypeID === 1 && pathname !== '/onboarding'
                        && pathname !== '/settings' && (
                            <div className='hidden lg:flex min-w-32'>
                                <Skeleton.Button active block />
                            </div>
                        )
                }
            </div>

            <div className='lg:hidden'>
                <Drawer
                    placement="left"
                    width={640}
                    onClose={() => setMenuOpen(false)}
                    open={menuOpen}
                    style={{ backgroundColor: '#d5f1bb' }}
                >
                    <div onClick={() => setMenuOpen(false)}>
                        <NavBar />
                    </div>
                </Drawer>
            </div>

            <div className='flex gap-2 lg:gap-4'>
                {/* Farm dropdown for small screens */}
                {
                    user && farms && user.userTypeID === 1 && farms.length > 0 && pathname !== '/onboarding'
                        && pathname !== '/settings' ?
                        <Dropdown menu={{
                            items: [
                                {
                                    key: 'name',
                                    label: (<span className='text-brown'> <b>Selección de fincas</b> <br />Puedes agregar más fincas <br /> o modificarlas  en la sección de configuración.</span>),
                                    disabled: true,
                                },
                                {
                                    type: 'divider',
                                    key: 'divider',
                                },
                            ].concat(
                                farms?.map(farm => {
                                    return {
                                        key: farm.farmID.toString(),
                                        label: (<>{farm.name}</>),
                                        disabled: false, // Add the disabled property here
                                        onClick: () => setFarm(farm.farmID),
                                    }
                                })
                            ),
                            selectable: true,
                            defaultSelectedKeys: [currentFarm?.toString() || farms[0].farmID.toString()]
                        }}
                            className='lg:hidden'
                            trigger={['click']}>
                            <button className="flex items-center justify-between gap-2 lg:py-2 lg:px-4 rounded-lg lg:border border-brown/20 hover:bg-brown-100/40  ">
                                <HomeTwo theme="outline" size="20" fill="#412F26" />
                                <span className='text-md font-semibold hidden lg:flex'>{farms?.find(farm => farm.farmID === currentFarm)?.name}</span>
                                <Sort theme='filled' size="1rem" fill="#412F26" />
                            </button>
                        </Dropdown>
                        : user && farms && user.userTypeID === 1 && pathname !== '/onboarding'
                        && pathname !== '/settings' && (<div className='lg:hidden'>
                            <Skeleton.Button active />
                        </div>)
                }


                {/* Account dropdown */}
                {user ?
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
                    : <div className='flex items-center'>
                        <Skeleton.Button active />
                    </div>
                }
            </div>

        </header>
    )
}