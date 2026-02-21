"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Coffee, CheckCircle } from "lucide-react";

export default function OrderStatusListener({ customerId }: { customerId: number }) {
    const router = useRouter();

    useEffect(() => {
        const channel = pusherClient.subscribe(`order-updates-${customerId}`);

        channel.bind("status-changed", (data: { transactionId: number; status: string }) => {
            router.refresh();

            if (data.status === 'ready') {
                toast("¡Tu Café está listo!", {
                    description: `La orden #${data.transactionId} ya puede recogerse en barra.`,
                    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
                });
            } else if (data.status === 'preparing') {
                toast("Preparando tu experiencia", {
                    description: `El equipo ya está trabajando en tu orden #${data.transactionId}.`,
                    icon: <Coffee className="w-5 h-5 text-indigo-400" />
                });
            }
        });

        return () => {
            pusherClient.unsubscribe(`order-updates-${customerId}`);
        };
    }, [customerId, router]);

    return null;
}
