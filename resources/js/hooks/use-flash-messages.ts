import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function useFlashMessages() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    
    useEffect(() => {
        const flash = props.flash;
        
        if (flash?.success) {
            toast.success(flash.success);
        }
        
        if (flash?.error) {
            toast.error(flash.error);
        }
        
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [props.flash]);
}
