import { Leaves, DiamondThree, Round } from "@icon-park/react";

export default function CropCard({ crop }: { crop: CropResponse }) {
    return (
        <div className="w-full md:max-w-72  rounded-lg border border-brown/15 p-4 flex flex-col gap-4 bg-brown-100/40 cursor-pointer hover:border-brown-500 hover:-translate-y-0.5 transition-transform duration-150">
            <div className="flex items-center justify-between gap-4">
                <div className="w-full flex flex-col gap-1 justify-center">
                    {/* Header with variety badge */}
                    <div className="w-full flex flex-wrap gap-1 items-center justify-between">
                        <div className="flex gap-1 pe-4 items-center">
                            <Leaves theme="outline" size="18" fill="#412F26" />
                            <h3 className="font-extrabold text-lg text-brown">Cultivo #{crop.cropID}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex gap-1 items-center rounded-full border border-brown-900 bg-brown-900/20 px-2 py-0.5">
                                <DiamondThree theme="filled" size="12" fill="#412F26" />
                                <p className="text-brown font-bold text-xs tracking-wider ">{crop.cropType?.name.toLocaleUpperCase()}</p>
                            </div>
                            <div className="lg:hidden flex gap-1 items-center rounded-full border border-green bg-green-900/20 px-2 py-0.5">
                                <Round theme="filled" size="12" fill="#63A91F" />
                                <p className="text-green font-bold text-xs tracking-wider">{crop.cropState?.name.toLocaleUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                    {/* State badge */}
                    <div className="hidden lg:flex flex-wrap gap-2">
                        <div className="flex gap-1 items-center rounded-full border border-green bg-green-900/20 px-2 py-0.5">
                            <Round theme="filled" size="12" fill="#63A91F" />
                            <p className="text-green font-bold text-xs tracking-wider">{crop.cropState?.name.toLocaleUpperCase()}</p>
                        </div>
                    </div>
                </div>

            </div>
            <div>

                <p className="text-brown/60 text-xs ">{crop.hectares} hectáreas sembradas</p>

                <p className="text-brown/60 text-xs ">Sembrado el {crop.plantingDate.toLocaleString(
                    'es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
            </div>
        </div>
    );
}