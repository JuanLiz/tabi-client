interface Harvest {
    cropID: number;
    harvestStateID: number;
    date: Date;
    amount: number;
}

interface HarvestResponse extends Harvest {
    harvestID: number;
    crop?: Crop;
    harvestState?: HarvestState;
}