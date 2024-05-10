interface DocTypeResponse {
    documentTypeID: number;
    name: string;
}

interface DocType extends DocTypeResponse {
    shortName?: string;
}