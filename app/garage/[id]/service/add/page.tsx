'use client';

import { useParams } from 'next/navigation';
import AddServiceForm from "@/features/garage/add/components/AddServiceForm";


export default function AddServicePage() {
    const params = useParams();
    const carId = params.id as string;

    return <AddServiceForm carId={carId} />;
}