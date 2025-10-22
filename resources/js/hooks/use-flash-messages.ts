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
        
        // DEBUG: Log flash messages
        console.log('🔍 useFlashMessages - props.flash:', flash);
        console.log('🔍 useFlashMessages - all props:', props);
        
        if (flash?.success) {
            console.log('✅ Showing success toast:', flash.success);
            toast.success(flash.success);
        }
        
        if (flash?.error) {
            console.log('❌ Showing error toast:', flash.error);
            toast.error(flash.error);
        }
        
        if (flash?.warning) {
            console.log('⚠️ Showing warning toast:', flash.warning);
            toast.warning(flash.warning);
        }
        
        if (flash?.info) {
            console.log('ℹ️ Showing info toast:', flash.info);
            toast.info(flash.info);
        }
    }, [props.flash]);
}
