import { Leaves } from "@icon-park/react";

export default function CropCard({ crop }: { crop: CropResponse }) {
    return (
        <div className="w-auto rounded-lg border border-brown/15 p-4 flex flex-col gap-2 bg-brown-100/40">
            <div>
                <div className="flex gap-2 items-center">
                    <Leaves theme="outline" size="18" fill="#412F26" />
                    <h3 className="font-extrabold text-lg text-brown">Cultivo #{crop.cropID}</h3>
                </div>
            </div>
            <div>

                <p className="text-brown/60 font-semibold text-xs ">{crop.hectares} hectáreas sembradas</p>

                <p className="text-brown/60 font-semibold text-xs ">Sembrado el {crop.plantingDate.toLocaleString(
                    'es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
            </div>
        </div>
    );
}