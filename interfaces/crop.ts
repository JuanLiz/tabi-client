interface Crop {
    lotID: number;
    hectares: number;
    cropTypeID: number;
    cropStateID: number;
    plantingDate: Date;
    harvestDate?: Date;
}

interface CropResponse extends Crop {
    cropID: number;
    lot?: Lot;
    cropType?: CropType;
    cropState?: CropState;
}