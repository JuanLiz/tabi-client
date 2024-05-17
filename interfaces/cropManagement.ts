interface CropManagement {
    cropID: number;
    date: Date;
    description: string;
}

interface CropManagementResponse extends CropManagement {
    cropManagementID: number;
    cropManagementTypeID: number;
    crop?: Crop;
    cropManagementType?: CropManagementType;
}