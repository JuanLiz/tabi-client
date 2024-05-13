interface Lot {
    name: string;
    hectares: number;
    slopeTypeID: number;
}

interface LotResponse extends Lot {
    farmID: number;
    lotID: number;
    farm?: Farm;
    slopeType?: SlopeType;
}

// For collapse view
interface LotView extends LotResponse {
    crops: CropResponse[];
}