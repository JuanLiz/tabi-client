import axiosInstance from "@/axiosInterceptor";
import { Button, DatePicker, Form, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function AddCropManagementModal({ crop, visible, setVisible, setIsCropManagementAdded }
    : {
        crop: CropResponse | undefined,
        visible: boolean,
        setVisible: React.Dispatch<React.SetStateAction<boolean>>,
        setIsCropManagementAdded: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [cropManagementTypes, setCropManagementTypes] = useState<CropManagementType[]>();

    const [addCropManagementForm] = Form.useForm();
    const [addCropManagementButtonLoading, setAddCropManagementButtonLoading] = useState(false);
    const [plantingDate, setPlantingDate] = useState<Date>();

    //== API Methods ==//
    const getCropManagementTypes = async () => {
        try {
            const response = await axiosInstance.get('/api/CropManagementType');
            setCropManagementTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const addCropManagement = async (values: any) => {

        if (!crop) return;
        setAddCropManagementButtonLoading(true);

        const form: FormData = new FormData();
        form.append('CropID', crop.cropID.toString());
        form.append('CropManagementTypeID', values.cropManagementTypeID);
        form.append('Date', values.date.format('YYYY-MM-DD'));
        form.append('Description', values.description);

        try {
            const response = await axiosInstance.post('/api/CropManagement', form);
            console.log(response);
        } catch (error) {
            console.error(error);
        } finally {
            setAddCropManagementButtonLoading(false);
            handleCancel();
            setIsCropManagementAdded(true);
        }
    }

    const handleCancel = () => {
        setVisible(false);
        addCropManagementForm.resetFields();
    }

    const onAddCropManagementFinish = async (values: any) => {
        addCropManagement(values);
    }

    useEffect(() => {
        getCropManagementTypes();
    }, []);


    return (
        <Modal
            title={`Agregar gestión en Cultivo #${crop?.cropID}`}
            open={visible}
            footer={null}
            onCancel={handleCancel}
        >
            <Form
                form={addCropManagementForm}
                layout="vertical"
                onFinish={onAddCropManagementFinish}
                style={{ margin: '1rem' }}
            >
                <div className='md:flex w-full gap-5'>
                    <Form.Item
                        className='md:w-1/2'
                        label="Tipo de gestión"
                        name="cropManagementTypeID"
                        rules={[{ required: true, message: 'Por favor, selecciona un tipo de gestión' }]}
                    >
                        <Select>
                            {cropManagementTypes?.map((cm, index) => {
                                return <Select.Option key={index} value={cm.cropManagementTypeID}>{cm.name}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className='md:w-1/2'
                        label="Fecha"
                        name="date"
                        rules={[{ required: true, message: 'Por favor, selecciona una fecha' }]}
                    >
                        <DatePicker
                            className="w-full"
                            onChange={(date) => setPlantingDate(date?.toDate())}
                            format='DD-MM-YYYY'
                            placeholder='Selecciona la fecha'
                            maxDate={dayjs(new Date().toISOString().split('T')[0], 'YYYY-MM-DD')}
                        />
                    </Form.Item>
                </div>
                <Form.Item
                    label="Descripción"
                    name="description"
                    rules={[{ required: true, message: 'Por favor, ingresa una descripción' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>
                <div className="w-full flex justify-end gap-2 pt-2">
                    <Button type="default" onClick={handleCancel}>Cancelar</Button>
                    <Button type="primary" htmlType="submit" loading={addCropManagementButtonLoading}>Enviar</Button>
                </div>
            </Form>
        </Modal>
    );
}